'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Store, Product, ProductVariant } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Copy, Package, Settings, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/dashboard/ProductCard';
import ProductFormModal from '@/components/dashboard/ProductFormModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function DashboardPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t, direction, language, setLanguage } = useLanguage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }

    if (user) {
      loadStoreAndProducts();
    }
  }, [user, router, authLoading]);

  const loadStoreAndProducts = async () => {
    if (!user) return;

    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!storeData) {
        router.push('/onboarding');
        return;
      }

      setStore(storeData);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      // Load variants for all products
      if (productsData && productsData.length > 0) {
        const productIds = productsData.map((p: Product) => p.id);
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds);

        // Attach variants to products
        const productsWithVariants = productsData.map((p: Product) => ({
          ...p,
          variants: variantsData?.filter((v: ProductVariant) => v.product_id === p.id) || [],
        }));

        setProducts(productsWithVariants);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStoreLink = () => {
    if (!store) return;
    const url = `${window.location.origin}/${store.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: t('dashboard.link_copied'),
      description: t('dashboard.link_copied_desc'),
    });
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadStoreAndProducts();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t('products.delete_confirm'))) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: t('dashboard.delete_product_title'),
        description: t('dashboard.delete_product_desc'),
      });

      loadStoreAndProducts();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden" dir={direction}>
        <header className="bg-[#008069] text-white sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8" />
                <div>
                  <h1 className="text-xl font-bold">{store?.name}</h1>
                  <p className="text-xs text-green-100">{t('dashboard.whatsapp_commerce')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                  variant="ghost"
                  className="text-white hover:bg-[#017561] rounded-2xl"
                >
                  <Globe className="w-4 h-4" />
                  <span className="sr-only">Switch Language</span>
                </Button>
                <Button
                  onClick={handleCopyStoreLink}
                  variant="ghost"
                  className="text-white hover:bg-[#017561] rounded-2xl"
                >
                  <Copy className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {t('dashboard.copy_link')}
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/settings')}
                  variant="ghost"
                  className="text-white hover:bg-[#017561] rounded-2xl"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  className="text-white hover:bg-[#017561] rounded-2xl"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.products')}</h2>
                <p className="text-gray-600">
                  {t('dashboard.products_count', { count: products.length })}
                </p>
              </div>
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  type="text"
                  placeholder={t('dashboard.search_products')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'} h-10 rounded-2xl border-gray-200`}
                />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('dashboard.no_products')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('dashboard.start_selling')}
              </p>
              <Button
                onClick={() => setShowProductForm(true)}
                className="rounded-3xl bg-[#008069] hover:bg-[#017561] h-12 px-8"
              >
                <Plus className={`w-5 h-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('dashboard.add_first_product')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .filter((product) => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    product.name.toLowerCase().includes(query) ||
                    product.description?.toLowerCase().includes(query) ||
                    product.category?.toLowerCase().includes(query)
                  );
                })
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
            </div>
          )}
        </main>

        {showProductForm && store && (
          <ProductFormModal
            storeId={store.id}
            storeSlug={store.slug}
            product={editingProduct}
            onClose={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onSaved={handleProductSaved}
          />
        )}
      </div>

      {products.length > 0 && (
        <button
          onClick={() => setShowProductForm(true)}
          className={`fixed bottom-8 ${direction === 'rtl' ? 'left-8' : 'right-8'} z-50 bg-[#008069] text-white rounded-full p-5 shadow-2xl hover:bg-[#017561] transition-all hover:scale-110`}
          aria-label={t('dashboard.add_product')}
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </>
  );
}
