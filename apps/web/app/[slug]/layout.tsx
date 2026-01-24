import { getSupabaseAdmin } from '@/lib/supabase/admin';

interface StoreLayoutProps {
    children: React.ReactNode;
    params: { slug: string };
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
    const supabase = getSupabaseAdmin();
    const { data: store } = await supabase
        .from('stores')
        .select('default_language')
        .eq('slug', params.slug)
        .maybeSingle();

    // Fallback to 'ar' (Arabic) if no store found or no language set
    const lang = store?.default_language || 'ar';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    return (
        <div lang={lang} dir={dir} className="min-h-screen">
            {children}
        </div>
    );
}
