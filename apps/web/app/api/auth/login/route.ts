import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signToken } from '@/lib/api/jwt';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';

interface LoginRequest {
    phone: string;
    password: string;
}


export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as LoginRequest;
        const { phone, password } = body;

        if (!phone || !password) {
            return NextResponse.json(
                { error: 'Phone and password are required' },
                { status: 400 }
            );
        }

        const standardizedPhone = standardizePhoneNumber(phone);
        const supabase = getSupabaseAdmin();

        // Find user by phone
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('phone', standardizedPhone)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Invalid phone number or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid phone number or password' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await signToken(user.id, user.phone);

        console.log('Login successful for:', user.phone);
        // Safe check for secret status
        const isUsingFallback = !process.env.JWT_SECRET;
        console.log('JWT Secret Status:', isUsingFallback ? 'USING FALLBACK' : 'CUSTOM SECRET CONFIGURED');

        // Set session cookie for Server Actions / Middleware support
        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                phone: user.phone,
                created_at: user.created_at,
            },
        });

        response.cookies.set('app-session', token, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
