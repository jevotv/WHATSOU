import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
    'https://localhost',
    'http://localhost',
    'capacitor://localhost',
    'http://localhost:3000',
    'https://whatsou.com',
    'https://whatsou.vercel.app'
];

export function middleware(request: NextRequest) {
    // Only handle API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const origin = request.headers.get('origin');
        const isAllowed = origin && (
            ALLOWED_ORIGINS.includes(origin) ||
            origin.endsWith('.vercel.app') // Allow all Vercel previews
        );

        // Handle preflight OPTIONS request
        if (request.method === 'OPTIONS') {
            const response = new NextResponse(null, { status: 200 });
            if (isAllowed) {
                response.headers.set('Access-Control-Allow-Origin', origin!);
                response.headers.set('Access-Control-Allow-Credentials', 'true');
                response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
                response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
            }
            return response;
        }

        // Handle actual request
        const response = NextResponse.next();
        if (isAllowed) {
            response.headers.set('Access-Control-Allow-Origin', origin!);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
        }
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
