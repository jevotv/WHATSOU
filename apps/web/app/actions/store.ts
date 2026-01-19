'use server';

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/app/actions/auth';
import QRCode from 'qrcode';

export async function createStore(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    // Use Admin Client (Service Role)
    // This expects SUPABASE_SERVICE_ROLE_KEY to be set in .env
    const supabase = getSupabaseAdmin();

    const user = session;

    // Verify user exists in public.users before creating store to avoid FK error
    const { data: userExists, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

    if (userCheckError || !userExists) {
        console.error('User check failed:', userCheckError);
        return { error: 'User record mismatch. Please log out and log in again.' };
    }

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
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';

        // 1. Insert store
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

        return { success: true, store: { ...store, qr_code: qrCodeDataUrl } };
    } catch (error: any) {
        console.error('Create store error:', error);
        return { error: error.message };
    }
}

export async function regenerateStoreQR(storeId: string) {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: store, error: fetchError } = await supabase
        .from('stores')
        .select('id, user_id')
        .eq('id', storeId)
        .single();

    if (fetchError || !store) return { error: 'Store not found' };
    if (store.user_id !== session.id) return { error: 'Unauthorized' };

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';
    const dynamicUrl = `${baseUrl}/go/${store.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(dynamicUrl);

    const { error: updateError } = await supabase
        .from('stores')
        .update({ qr_code: qrCodeDataUrl })
        .eq('id', storeId);

    if (updateError) return { error: updateError.message };

    return { success: true, qr_code: qrCodeDataUrl };
}

export async function getStoreForCurrentUser() {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized', debug_session: session };
    }

    const supabase = getSupabaseAdmin();

    const { data: store, error: dbError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', session.id)
        .maybeSingle();

    if (dbError) {
        return { error: `DB Error: ${dbError.message}`, debug_session: session };
    }

    return { store, debug_session: session };
}
