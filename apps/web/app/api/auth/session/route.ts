import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/api/jwt';
import { getSupabaseAdmin } from '@/lib/supabase/admin';


export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { authenticated: false, user: null },
                { status: 200 }
            );
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { authenticated: false, user: null },
                { status: 200 }
            );
        }

        // Optionally fetch user details from database
        const supabase = getSupabaseAdmin();
        const { data: user } = await supabase
            .from('users')
            .select('id, phone, created_at')
            .eq('id', payload.userId)
            .single();

        return NextResponse.json({
            authenticated: true,
            user: user || { id: payload.userId, phone: payload.phone },
        });
    } catch (error: any) {
        console.error('Session check error:', error);
        return NextResponse.json(
            { authenticated: false, user: null, error: error.message },
            { status: 200 }
        );
    }
}
