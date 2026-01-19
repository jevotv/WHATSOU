import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import QRCode from 'qrcode';

// POST: Create a new store
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();
        const body = await req.json();

        // Verify user exists in public.users
        const { data: userExists, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', auth.userId)
            .single();

        if (userCheckError || !userExists) {
            console.error('User check failed:', userCheckError);
            return NextResponse.json(
                { error: 'User record mismatch. Please log out and log in again.' },
                { status: 401 }
            );
        }

        const {
            name,
            slug,
            description,
            whatsapp_number,
            default_language,
            logo_url,
            email,
            facebook_url,
            instagram_url,
            twitter_url,
            tiktok_url,
            location_url,
            allow_delivery,
            allow_pickup
        } = body;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';

            // 1. Insert store
            const { data: store, error: insertError } = await supabase.from('stores').insert({
                user_id: auth.userId,
                name,
                slug,
                description: description || null,
                whatsapp_number,
                default_language,
                logo_url: logo_url || null,
                email: email || null,
                facebook_url: facebook_url || null,
                instagram_url: instagram_url || null,
                twitter_url: twitter_url || null,
                tiktok_url: tiktok_url || null,
                location_url: location_url || null,
                allow_delivery,
                allow_pickup,
            }).select().single();

            if (insertError) {
                // Handle duplicate slug error specifically if needed, but generic 500 covers for now
                console.error('Store insert error:', insertError);
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }

            // 2. Generate QR
            const dynamicUrl = `${baseUrl}/go/${store.id}`;
            const qrCodeDataUrl = await QRCode.toDataURL(dynamicUrl);

            // 3. Update store with QR
            const { error: updateError } = await supabase
                .from('stores')
                .update({ qr_code: qrCodeDataUrl })
                .eq('id', store.id);

            if (updateError) {
                console.error('Failed to update store with QR:', updateError);
            }

            return NextResponse.json({ success: true, store: { ...store, qr_code: qrCodeDataUrl } });

        } catch (error: any) {
            console.error('Create store API error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    });
}

// GET: Get user's store details
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        const { data: store, error } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', auth.userId)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ store });
    });
}

// PUT: Update store settings
export async function PUT(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Get user's store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, user_id')
            .eq('user_id', auth.userId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const data = await req.json();

        // Update store
        const { error } = await supabase
            .from('stores')
            .update(data)
            .eq('id', store.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    });
}
