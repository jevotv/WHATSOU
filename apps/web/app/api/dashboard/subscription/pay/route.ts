
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const paymentMethod = body.paymentMethod || 'card';

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/paymob-create-intention`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({
                        user_id: auth.userId,
                        payment_method: paymentMethod,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return NextResponse.json({ error: error.error || 'Payment initiation failed' }, { status: response.status });
            }

            const data = await response.json();
            return NextResponse.json({ success: true, ...data });
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
        }
    });
}
