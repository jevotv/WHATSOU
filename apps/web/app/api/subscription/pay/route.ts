import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';

// POST: Initiate payment
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const data = await req.json();
        const paymentMethod = data.paymentMethod || 'card';

        try {
            // Call the edge function
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/paymob-create-intention`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({
                        user_id: auth.userId,
                        payment_method: paymentMethod,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json(
                    { error: error.error || 'Payment initiation failed' },
                    { status: 500 }
                );
            }

            const result = await response.json();
            return NextResponse.json({ success: true, ...result });
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            return NextResponse.json(
                { error: error.message || 'Payment initiation failed' },
                { status: 500 }
            );
        }
    });
}
