import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;

    if (!id) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Use service role or anon key depending on RLS. Stores should be public usually.
    // Using anon key here safely assuming stores are public.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: store, error } = await supabase
        .from('stores')
        .select('slug')
        .eq('id', id)
        .single();

    if (error || !store || !store.slug) {
        // Store not found or error, redirect to home with error generic
        return NextResponse.redirect(new URL('/?error=store_not_found', request.url));
    }

    // Redirect to the store's slug
    return NextResponse.redirect(new URL(`/${store.slug}`, request.url));
}
