
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', auth.userId)
            .single();

        if (!subscription) {
            return NextResponse.json({
                id: null,
                status: 'inactive',
                expiresAt: null,
                daysRemaining: null,
                isReadOnly: true,
                amount: 100,
                isFirstSubscription: true,
            });
        }

        let daysRemaining: number | null = null;
        let calculatedStatus: 'active' | 'grace' | 'expired' | 'inactive' = 'active';
        let isReadOnly = false;

        const now = new Date();

        if (subscription.expires_at) {
            const expiresAt = new Date(subscription.expires_at);
            const graceEndsAt = subscription.grace_ends_at ? new Date(subscription.grace_ends_at) : null;

            daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (now > expiresAt) {
                if (graceEndsAt && now <= graceEndsAt) {
                    calculatedStatus = 'grace';
                    isReadOnly = true;
                } else {
                    calculatedStatus = 'expired';
                    isReadOnly = true;
                }
            } else {
                calculatedStatus = 'active';
                isReadOnly = false;
            }
        } else if (subscription.pending_expires_at) {
            const pendingExpiresAt = new Date(subscription.pending_expires_at);
            if (now <= pendingExpiresAt) {
                calculatedStatus = 'active';
                isReadOnly = false;
                daysRemaining = null;
            } else {
                calculatedStatus = 'inactive';
                isReadOnly = true;
            }
        } else {
            calculatedStatus = 'inactive';
            isReadOnly = true;
        }

        const amount = subscription.is_first_subscription ? 100 : 300;

        return NextResponse.json({
            id: subscription.id,
            status: calculatedStatus,
            expiresAt: subscription.expires_at,
            daysRemaining,
            isReadOnly,
            amount,
            isFirstSubscription: !!subscription.is_first_subscription,
        });
    });
}
