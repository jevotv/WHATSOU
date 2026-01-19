import { NextResponse } from 'next/server';


export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function POST() {
    // For JWT-based auth, logout is handled client-side by clearing the token.
    // This endpoint exists for completeness and can be used for any server-side cleanup.

    return NextResponse.json({
        success: true,
        message: 'Logged out successfully',
    });
}
