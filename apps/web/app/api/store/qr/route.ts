import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import QRCode from 'qrcode';

// POST: Regenerate QR code for store
export async function POST(request: NextRequest) {
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

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';
        const dynamicUrl = `${baseUrl}/go/${store.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(dynamicUrl);

        // Update store with new QR
        const { error: updateError } = await supabase
            .from('stores')
            .update({ qr_code: qrCodeDataUrl })
            .eq('id', store.id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            qr_code: qrCodeDataUrl,
        });
    });
}
