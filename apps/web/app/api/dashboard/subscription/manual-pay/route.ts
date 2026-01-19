
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { payment_method, subscription_period = 'monthly' } = body;

            if (!payment_method) {
                return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manual-payment-request`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({
                        user_id: auth.userId,
                        payment_method: payment_method,
                        subscription_period: subscription_period,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json({ error: error.error || 'Manual payment request failed' }, { status: response.status });
            }

            const data = await response.json();
            return NextResponse.json({ success: true, ...data });
        } catch (error: any) {
            console.error('Manual payment error:', error);
            return NextResponse.json({ error: error.message || 'Manual payment request failed' }, { status: 500 });
        }
    });
}
