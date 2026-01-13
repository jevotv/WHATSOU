import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export type AuthenticatedHandler = (
    request: NextRequest,
    auth: JWTPayload
) => Promise<NextResponse>;

/**
 * Middleware wrapper that validates JWT token from Authorization header
 * and passes the authenticated user info to the handler.
 */
export async function withAuth(
    request: NextRequest,
    handler: AuthenticatedHandler
): Promise<NextResponse> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
            { error: 'Unauthorized - No token provided' },
            { status: 401 }
        );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json(
            { error: 'Unauthorized - Invalid or expired token' },
            { status: 401 }
        );
    }

    return handler(request, payload);
}

/**
 * Helper to extract JSON body with type safety
 */
export async function getJsonBody<T>(request: NextRequest): Promise<T | null> {
    try {
        return await request.json() as T;
    } catch {
        return null;
    }
}
