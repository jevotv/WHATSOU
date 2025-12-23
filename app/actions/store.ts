'use server';

import { getSession } from '@/app/actions/auth';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { Store } from '@/lib/types/database';

export async function createStore(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    // Use Service Role to bypass RLS since we are using custom auth
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const user = session;

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const whatsapp_number = formData.get('whatsapp_number') as string;
    const default_language = formData.get('default_language') as string;
    const logo_url = formData.get('logo_url') as string;
    const email = formData.get('email') as string;
    const facebook_url = formData.get('facebook_url') as string;
    const instagram_url = formData.get('instagram_url') as string;
    const twitter_url = formData.get('twitter_url') as string;
    const tiktok_url = formData.get('tiktok_url') as string;
    const location_url = formData.get('location_url') as string;
    const allow_delivery = formData.get('allow_delivery') === 'true';
    const allow_pickup = formData.get('allow_pickup') === 'true';

    try {
        // Generate QR Code
        // The link should point to the store's public page
        // We'll assume the base URL is derived from the environment or headers, 
        // but here we can just store the relative path or fully qualified if we know the domain.
        // Ideally we use a fully qualified URL. For now, we'll assume the client sends the origin or we construct it.
        // BUT server actions don't easily get window.location.
        // Let's store the full URL if possible, or just the slug path and client constructs full URL for display?
        // User asked to store the QR code *image string* (Base64), not just the link.
        // The QR should ENCODE the link to the store.

        // Construct the store URL. In production, use NEXT_PUBLIC_SITE_URL or similar.
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com'; // Fallback

        // 1. Insert store first to get the ID
        const { data: store, error: insertError } = await supabase.from('stores').insert({
            user_id: user.id,
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

        if (insertError) throw insertError;

        // 2. Generate QR pointing to /go/[id]
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

        return { success: true, store: { ...store, qr_code: qrCodeDataUrl } };
    } catch (error: any) {
        console.error('Create store error:', error);
        return { error: error.message };
    }
}
