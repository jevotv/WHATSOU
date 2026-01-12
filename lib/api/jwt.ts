'use server';

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    phone: string;
}

export async function signToken(userId: string, phone: string): Promise<string> {
    const token = await new SignJWT({ userId, phone })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

    return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            userId: payload.userId as string,
            phone: payload.phone as string,
        };
    } catch {
        return null;
    }
}
