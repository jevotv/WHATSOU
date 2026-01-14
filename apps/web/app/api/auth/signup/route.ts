import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { signToken } from '@/lib/api/jwt';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import { sendNewUserAlert } from '@/lib/telegram';

interface SignupRequest {
    phone: string;
    password: string;
    agreedToPrivacy?: boolean;
}


// OPTIONS: Handle CORS preflight explicitly
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        },
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as SignupRequest;
        const { phone, password, agreedToPrivacy } = body;

        if (!phone || !password) {
            return NextResponse.json(
                { error: 'Phone and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const standardizedPhone = standardizePhoneNumber(phone);
        const supabase = getSupabaseAdmin();

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('phone', standardizedPhone)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Phone number already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                phone: standardizedPhone,
                password_hash: passwordHash,
                agreed_to_privacy: agreedToPrivacy ?? true,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Signup error:', insertError);
            return NextResponse.json(
                { error: `Failed to create account: ${insertError.message}` },
                { status: 500 }
            );
        }

        // Send Telegram alert (non-blocking)
        sendNewUserAlert(standardizedPhone, newUser.created_at).catch(console.error);

        // Generate JWT token
        const token = await signToken(newUser.id, newUser.phone);

        // Set session cookie for Server Actions / Middleware support
        const response = NextResponse.json({
            success: true,
            token,
            user: {
                id: newUser.id,
                phone: newUser.phone,
                created_at: newUser.created_at,
            },
        });

        response.cookies.set('app-session', token, {
            httpOnly: false, // Allow client access if needed (debugging)
            secure: false, // For easier dev/debugging
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'Signup failed' },
            { status: 500 }
        );
    }
}
