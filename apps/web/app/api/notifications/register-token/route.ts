import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/jwt';

export async function POST(request: NextRequest) {
    try {
        const { token, platform } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 });
        }

        const supabase = await createServerClient();

        let userId: string | undefined;

        // 1. Try getting user from Supabase cookies (Web Browser)
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;

        // 2. If not found, try getting user from Authorization Header (Mobile App)
        // Access token is sent as "Bearer <token>"
        if (!userId) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const authToken = authHeader.split(' ')[1];

                // Decode custom JWT using our shared secret
                const payload = await verifyToken(authToken);
                if (payload) {
                    userId = payload.userId;
                    console.log('Mobile auth success:', userId);
                } else {
                    console.error('Mobile auth failed: Invalid custom JWT');
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update existing user with new FCM token
        // Ignoring platform since users table only has fcm_token column
        // REMOVED updated_at as it does not exist in the users table
        const { error } = await supabase
            .from('users')
            .update({
                fcm_token: token
            })
            .eq('id', userId);

        if (error) {
            console.error('Error saving fcm_token', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in register-token:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
