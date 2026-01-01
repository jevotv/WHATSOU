
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library'

interface Order {
    id: string
    store_id: string
    customer_name: string
    total_price: number
}

Deno.serve(async (req) => {
    try {
        const payload = await req.json()
        const { record } = payload as { record: Order }

        // 1. Validate input
        if (!record || !record.store_id) {
            return new Response('No record or store_id', { status: 400 })
        }

        // 2. Initialize Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Get Store Owner's User ID
        const { data: store, error: storeError } = await supabaseClient
            .from('stores')
            .select('user_id, name')
            .eq('id', record.store_id)
            .single()

        if (storeError || !store) {
            console.error('Store not found', storeError)
            return new Response('Store not found', { status: 404 })
        }

        // 4. Get Owner's FCM Token
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('fcm_token')
            .eq('id', store.user_id)
            .single()

        if (userError || !user?.fcm_token) {
            console.log('No FCM token for user', store.user_id)
            return new Response('No FCM token found', { status: 200 })
        }

        // 5. Authenticate with Firebase using Service Account
        const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') ?? '{}')

        // Use google-auth-library to get an access token
        const client = new JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        })

        const accessToken = await client.authorize()

        // 6. Send Notification via FCM v1 API
        const projectId = serviceAccount.project_id
        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

        const message = {
            message: {
                token: user.fcm_token,
                notification: {
                    title: 'New Order Received! 💰',
                    body: `Order from ${record.customer_name} for ${record.total_price}`,
                },
                data: {
                    url: `/dashboard/orders/${record.id}`,
                    orderId: record.id
                }
            }
        }

        const response = await fetch(fcmUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('FCM Error:', errorText)
            return new Response(`FCM Error: ${errorText}`, { status: 500 })
        }

        const result = await response.json()
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })

    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
