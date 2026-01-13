import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createServerClient();

    // Fetch all active stores
    const { data: stores } = await supabase
        .from('stores')
        .select('slug, updated_at')
        .order('created_at', { ascending: false });

    const mainSitemap = `
    <sitemap>
      <loc>https://whatsou.com/main-sitemap.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `;

    const storeSitemaps = (stores || [])
        .map((store) => `
      <sitemap>
        <loc>https://whatsou.com/${store.slug}/sitemap.xml</loc>
        <lastmod>${store.updated_at || new Date().toISOString()}</lastmod>
      </sitemap>
    `)
        .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${mainSitemap}
      ${storeSitemaps}
    </sitemapindex>
  `;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        },
    });
}
