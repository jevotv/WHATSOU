import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

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
