import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token, platform } = await request.json();

        if (!token || !platform) {
            return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 });
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
                // Supabase getUser can verify the JWT token
                const { data: { user: mobileUser }, error: mobileError } = await supabase.auth.getUser(authToken);
                if (!mobileError && mobileUser) {
                    userId = mobileUser.id;
                }
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('notification_tokens')
            .upsert({
                user_id: userId,
                token,
                platform,
                updated_at: new Date().toISOString()
            }, { onConflict: 'token' });

        if (error) {
            console.error('Error saving token', error);
            // Verify if table exists
            if (error.code === '42P01') { // undefined_table
                return NextResponse.json({ error: 'Database table missing. Please run migrations.' }, { status: 500 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in register-token:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
