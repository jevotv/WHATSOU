
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        const { data: transactions } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('user_id', auth.userId)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({ transactions: transactions || [] });
    });
}
