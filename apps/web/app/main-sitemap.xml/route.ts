export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = 'https://whatsou.com';
    const now = new Date().toISOString();

    const staticPages = [
        { loc: baseUrl, changefreq: 'weekly', priority: '1.0' },
        { loc: `${baseUrl}/login`, changefreq: 'monthly', priority: '0.3' },
        { loc: `${baseUrl}/signup`, changefreq: 'monthly', priority: '0.5' },
        { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.2' },
    ];

    const urlEntries = staticPages
        .map((page) => `
    <url>
      <loc>${page.loc}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`)
        .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
        },
    });
}
