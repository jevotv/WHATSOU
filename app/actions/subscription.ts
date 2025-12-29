'use server';

import { getSession } from '@/app/actions/auth';
import { createClient } from '@supabase/supabase-js';

export interface SubscriptionStatus {
    id: string | null;
    status: 'inactive' | 'active' | 'grace' | 'expired';
    expiresAt: string | null;
    daysRemaining: number | null;
    isReadOnly: boolean;
    amount: number;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const session = await getSession();

    if (!session || !session.id) {
        return {
            id: null,
            status: 'inactive',
            expiresAt: null,
            daysRemaining: null,
            isReadOnly: false,
            amount: 100, // First subscription price
        };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.id)
        .single();

    if (!subscription) {
        return {
            id: null,
            status: 'inactive',
            expiresAt: null,
            daysRemaining: null,
            isReadOnly: false,
            amount: 100, // First subscription price
        };
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
            // Subscription has expired
            if (graceEndsAt && now <= graceEndsAt) {
                calculatedStatus = 'grace';
                isReadOnly = true; // Grace period = read-only
            } else {
                calculatedStatus = 'expired';
                isReadOnly = true; // Expired = read-only
            }
        } else {
            calculatedStatus = 'active';
            isReadOnly = false;
        }
    } else {
        // Subscription exists but not yet paid (no expires_at)
        calculatedStatus = 'inactive';
        isReadOnly = true; // Block access until paid
    }

    // Amount: 100 EGP first time, 300 EGP renewal
    const amount = subscription.is_first_subscription ? 100 : 300;

    return {
        id: subscription.id,
        status: calculatedStatus,
        expiresAt: subscription.expires_at,
        daysRemaining,
        isReadOnly,
        amount,
    };
}

export async function initiatePayment(paymentMethod: 'card' | 'wallet' = 'card') {
    const session = await getSession();

    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Call the edge function
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/paymob-create-intention`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    user_id: session.id,
                    payment_method: paymentMethod,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return { error: error.error || 'Payment initiation failed' };
        }

        const data = await response.json();
        return { success: true, ...data };
    } catch (error: any) {
        console.error('Payment initiation error:', error);
        return { error: error.message || 'Payment initiation failed' };
    }
}

export async function getPaymentHistory() {
    const session = await getSession();

    if (!session || !session.id) {
        return { transactions: [] };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', session.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return { transactions: transactions || [] };
}
