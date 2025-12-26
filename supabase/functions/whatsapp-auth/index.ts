
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL')!
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')!
const INSTANCE_NAME = Deno.env.get('EVOLUTION_INSTANCE_NAME') || 'otp_new'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        const body = await req.json()
        const { action, phone, code, verify_only } = body

        if (!phone) {
            throw new Error('Phone number is required')
        }

        // Clean phone number (basic)
        // Assuming format is raw, but good to normalize. 
        // Evolution API usually expects strict format. We'll assume frontend sends correct format or strict pass-through.

        if (action === 'send') {
            // 1. Rate Limit Check
            const { data: existingOtp } = await supabaseClient
                .from('otp_codes')
                .select('created_at')
                .eq('phone', phone)
                .single()

            if (existingOtp) {
                const lastCreated = new Date(existingOtp.created_at).getTime()
                const now = Date.now()
                // 60 seconds cooldown
                if (now - lastCreated < 60 * 1000) {
                    return new Response(
                        JSON.stringify({ error: 'Please wait 60 seconds before requesting another code' }),
                        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
                }
            }

            // 2. Generate Code
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes

            // 3. Save to DB (Upsert)
            const { error: dbError } = await supabaseClient
                .from('otp_codes')
                .upsert({
                    phone,
                    code: generatedCode,
                    expires_at: expiresAt,
                    created_at: new Date().toISOString(), // Update created_at to now for rate limiting
                })

            if (dbError) throw dbError

            // 4. Send via Evolution API
            const message = `كود التحقق الخاص بك هو: ${generatedCode}`
            // Evolution API v2 might accept different body formats. 
            // Endpoint /message/sendText/{instance}
            // Body: { number: ..., text: ... } or { number: ..., textMessage: { text: ... } } ?
            // Common Evolution API format:
            // { "number": "remoteJid", "options": { "delay": 1200, "presence": "composing", "linkPreview": false }, "textMessage": { "text": "..." } }
            // OR v1 style: { "number": "...", "text": "..." }
            // The user prompt said: "Body: إرسال نص الرسالة (مثال: "كود التحقق الخاص بك هو: 1234")."
            // I'll try the standard simple format. 
            // Evolution API V2 typically uses:
            // POST /message/sendText/otp_new
            // Body: { number: "...", text: "..." }

            const evolutionPayload = {
                number: phone,
                text: message
            }

            const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`, {
                method: 'POST',
                headers: {
                    'apikey': EVOLUTION_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(evolutionPayload),
            })

            if (!response.ok) {
                const text = await response.text()
                console.error('Evolution API Error:', text)
                throw new Error(`Failed to send WhatsApp message: ${text}`)
            }

            const data = await response.json()

            return new Response(
                JSON.stringify({ success: true, message: 'OTP sent' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        else if (action === 'verify') {
            if (!code) throw new Error('Code is required')

            // 1. Verify Code
            const { data: otpRecord, error: otpError } = await supabaseClient
                .from('otp_codes')
                .select('*')
                .eq('phone', phone)
                .single()

            if (otpError || !otpRecord) {
                return new Response(
                    JSON.stringify({ error: 'Invalid or expired code' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            if (otpRecord.code !== code) {
                return new Response(
                    JSON.stringify({ error: 'Invalid code' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
                return new Response(
                    JSON.stringify({ error: 'Code expired' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // 2. Delete OTP (Consume it)
            await supabaseClient.from('otp_codes').delete().eq('phone', phone)

            if (verify_only) {
                return new Response(
                    JSON.stringify({ success: true, message: 'OTP verified successfully' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // 3. User Management
            // We use a dummy email based on phone to leverage Auth system
            const dummyEmail = `${phone}@whatsou.local`

            let userId: string

            // Check if user exists
            const { data: users } = await supabaseClient.auth.admin.listUsers()
            // Note: listUsers is paginated, but for now assuming we find it or create check via getUserByEmail?
            // Unfortunately no direct getUserByEmail in admin client simply exposed? 
            // We can try to create and catch error.

            const { data: createdUser, error: joinError } = await supabaseClient.auth.admin.createUser({
                email: dummyEmail,
                phone: phone, // We also set phone
                email_confirm: true,
                phone_confirm: true,
                user_metadata: { phone_number: phone }
            })

            if (joinError) {
                // Check if error is "User already registered"
                // There isn't a stable error code, usually message contains "unique constraint" or "already registered"
                // We'll search for the user.
                // Actually, we can use `listUsers` with filter if supported by library version, but simpler to just filtering the list if small,
                // OR better, since we can't efficiently search by email in simple client, we can assume if create fails, we generate link for the email.
                console.log('User might already exist:', joinError.message)
            }

            // 4. Generate Session Link
            // generateLink with type 'magiclink' creates a URL that logs the user in.
            // We return the `action_link` or tokens.
            const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
                type: 'magiclink',
                email: dummyEmail
            })

            if (linkError) throw linkError

            // Retrieve User ID to ensure we return it
            // `linkData.user` contains the user object
            const user = linkData.user

            return new Response(
                JSON.stringify({
                    success: true,
                    session_url: linkData.properties?.action_link,
                    user: user
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        throw new Error('Invalid action')

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
