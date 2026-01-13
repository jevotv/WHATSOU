import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET: Get customers (aggregated from orders)
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Get user's store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('user_id', auth.userId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Get orders for aggregation
        const { data: orders, error } = await supabase
            .from('orders')
            .select('customer_name, customer_phone, created_at')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ customers: orders || [] });
    });
}
