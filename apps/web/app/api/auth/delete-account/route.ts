import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// POST: Delete user account (using POST instead of DELETE to support body)
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const body = await req.json();
        const { reason } = body;

        if (!reason || !reason.trim()) {
            return NextResponse.json(
                { error: 'Deletion reason is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get user info for audit
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('phone')
            .eq('id', auth.userId)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get store info for audit
        const { data: store } = await supabase
            .from('stores')
            .select('name')
            .eq('user_id', auth.userId)
            .single();

        // Create audit record
        const { error: auditError } = await supabase
            .from('deleted_users')
            .insert({
                phone: user.phone,
                store_name: store?.name || null,
                deletion_reason: reason,
                user_id: auth.userId,
            });

        if (auditError) {
            console.error('Audit error:', auditError);
            // Continue with deletion even if audit fails
        }

        // Delete user (cascades to store, products, orders, etc.)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', auth.userId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    });
}
