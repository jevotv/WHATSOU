import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET: Get orders for user's store
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Get user's store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id, allow_delivery, allow_pickup')
            .eq('user_id', auth.userId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Get orders
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            orders: orders || [],
            storeSettings: {
                allow_delivery: store.allow_delivery,
                allow_pickup: store.allow_pickup,
            },
        });
    });
}
