import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import QRCode from 'qrcode';

// POST: Create a new store
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Check if user already has a store
        const { data: existingStore } = await supabase
            .from('stores')
            .select('id')
            .eq('user_id', auth.userId)
            .single();

        if (existingStore) {
            return NextResponse.json(
                { error: 'User already has a store' },
                { status: 409 }
            );
        }

        // Verify user exists
        const { data: userExists } = await supabase
            .from('users')
            .select('id')
            .eq('id', auth.userId)
            .single();

        if (!userExists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const data = await req.json();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';

        // Insert store
        const { data: store, error: insertError } = await supabase
            .from('stores')
            .insert({
                user_id: auth.userId,
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                whatsapp_number: data.whatsapp_number,
                default_language: data.default_language || 'ar',
                logo_url: data.logo_url || null,
                email: data.email || null,
                facebook_url: data.facebook_url || null,
                instagram_url: data.instagram_url || null,
                twitter_url: data.twitter_url || null,
                tiktok_url: data.tiktok_url || null,
                location_url: data.location_url || null,
                allow_delivery: data.allow_delivery ?? true,
                allow_pickup: data.allow_pickup ?? false,
            })
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // Generate QR code
        const dynamicUrl = `${baseUrl}/go/${store.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(dynamicUrl);

        // Update store with QR
        await supabase
            .from('stores')
            .update({ qr_code: qrCodeDataUrl })
            .eq('id', store.id);

        return NextResponse.json({
            success: true,
            store: { ...store, qr_code: qrCodeDataUrl },
        });
    });
}
