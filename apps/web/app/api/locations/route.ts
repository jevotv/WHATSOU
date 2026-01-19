import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = getSupabaseAdmin();

        // Fetch cities (small dataset)
        const { data: cities, error: citiesError } = await supabase
            .from('cities')
            .select('*')
            .order('name_ar');

        if (citiesError) throw citiesError;

        // Fetch districts with pagination (large dataset > 1000 rows)
        let allDistricts: any[] = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data: districts, error: districtsError } = await supabase
                .from('districts')
                .select('*')
                .order('name_ar')
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (districtsError) throw districtsError;

            if (districts && districts.length > 0) {
                allDistricts = [...allDistricts, ...districts];
                if (districts.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        return NextResponse.json({
            success: true,
            cities: cities || [],
            districts: allDistricts
        });

    } catch (error: any) {
        console.error('Locations API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
}
