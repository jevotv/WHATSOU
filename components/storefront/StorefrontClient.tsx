'use client';

import { useState, useMemo, useEffect } from 'react';
import { Store, Product } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCart, Minus, Plus, Package, Zap, Search, Loader2, LayoutGrid, List, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import CartDrawer from './CartDrawer';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, Facebook, Instagram, Twitter } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

import AdminBar from './AdminBar';


interface StorefrontClientProps {
  store: Store;
  products: Product[];
}

// Calculate total stock for a product
const getTotalStock = (product: Product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + v.quantity, 0);
  }
  return product.quantity;
};

export default function StorefrontClient({ store, products }: StorefrontClientProps) {
  const { t, language, setLanguage, direction } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>(t('storefront.all_categories'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Set default view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      // If width < 640px (sm breakpoint), default to list, else grid
      // Only set if it hasn't been manually toggled? 
      // User request: "Default way of display". 
      // We'll set it on mount.
      if (window.innerWidth < 640) {
        setViewMode('list');
      } else {
        setViewMode('grid');
      }
    };

    // Run on mount
    handleResize();

    // Optional: Add resize listener if we want it to adapt dynamically
    // window.addEventListener('resize', handleResize);
    // return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { addItem, totalItems } = useCart();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const isOwner = user?.id === store.user_id;


  // Filter out of stock products
  const availableProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.unlimited_stock) return true;
      return getTotalStock(product) > 0;
    });
  }, [products]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(availableProducts.map((p) => p.category).filter(Boolean));
    return [t('storefront.all_categories'), ...Array.from(cats)] as string[];
  }, [availableProducts, t]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = availableProducts;

    // Filter by category
    if (selectedCategory !== t('storefront.all_categories')) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [availableProducts, selectedCategory, searchQuery]);

  // Handle quantity change with stock limit
  const updateQuantity = (productId: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: newQty };
    });
  };

  const getQuantity = (productId: string) => quantities[productId] || 1;

  // Add to cart (for simple products only - products with options need detail page)
  const handleAddToCart = (product: Product) => {
    const hasOptions = product.options && product.options.length > 0;
    if (hasOptions) {
      // Redirect to product detail for option selection
      return;
    }

    const qty = getQuantity(product.id);
    const totalStock = getTotalStock(product);

    // Validate stock
    if (!product.unlimited_stock && qty > totalStock) {
      toast({
        title: t('storefront.not_enough_stock'),
        description: t('storefront.not_enough_stock_desc', { count: totalStock }),
        variant: 'destructive',
      });
      return;
    }

    addItem({
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      price: product.current_price,
      selected_options: {},
      image_url: product.thumbnail_url || product.image_url,
    });

    toast({
      title: t('storefront.added_to_cart'),
      description: t('storefront.added_to_cart_desc', { quantity: qty, name: product.name }),
    });

    // Reset quantity
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  // Initialize default language from store settings if no preference is saved
  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (!storedLang && store.default_language && ['en', 'ar'].includes(store.default_language)) {
      setLanguage(store.default_language as 'en' | 'ar');
    }
  }, [store.default_language, setLanguage]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
      {/* Admin Bar - Only valid if not loading and user is owner */}
      {!loading && isOwner && <AdminBar />}

      {/* Header */}

      <header className="bg-white w-full pt-8 pb-4 border-b border-gray-100 relative">
        <div className="absolute top-4 right-4 sm:right-8 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#19e65e]"
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center max-w-[960px] w-full px-4">
            <div className="flex flex-col items-center gap-4">
              {/* Store Logo */}
              <div className="relative h-24 w-24 rounded-full ring-4 ring-[#19e65e]/10 overflow-hidden bg-gradient-to-br from-[#19e65e] to-[#0a8f35]">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {store.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="flex items-center gap-4 mt-2">
                {store.facebook_url && (
                  <a
                    href={store.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#1877F2] transition-colors bg-gray-50 p-2 rounded-full hover:bg-[#1877F2]/10"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {store.instagram_url && (
                  <a
                    href={store.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E4405F] transition-colors bg-gray-50 p-2 rounded-full hover:bg-[#E4405F]/10"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {store.twitter_url && (
                  <a
                    href={store.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#1DA1F2] transition-colors bg-gray-50 p-2 rounded-full hover:bg-[#1DA1F2]/10"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {store.tiktok_url && (
                  <a
                    href={store.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#000000] transition-colors bg-gray-50 p-2 rounded-full hover:bg-[#000000]/10"
                  >
                    {/* Custom TikTok Icon */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                )}
                {store.location_url && (
                  <a
                    href={store.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#EA4335] transition-colors bg-gray-50 p-2 rounded-full hover:bg-[#EA4335]/10"
                  >
                    <MapPin className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Store Info */}

              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
                {store.description && (
                  <p className="text-gray-500 max-w-md mx-auto">{store.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Category Filter Bar */}
      <div className="sticky top-0 z-20 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3">
        <div className="flex justify-center w-full">
          <div className="max-w-[1200px] w-full px-4 sm:px-8 space-y-3">
            {/* Search Bar */}
            {/* Search Bar & View Toggle */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder={t('storefront.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 rounded-full border-gray-200 focus:ring-2 focus:ring-[#19e65e] text-base"
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0 h-11">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#111813]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#111813]' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex h-9 shrink-0 items-center justify-center rounded-full px-6 transition-all ${selectedCategory === category
                    ? 'bg-[#111813] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span className="text-sm font-medium leading-normal">{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex justify-center py-8">
        <div className="flex flex-col max-w-[1200px] w-full px-4 sm:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">{t('storefront.no_products')}</p>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
            }>
              {filteredProducts.map((product) => {
                const hasDiscount = product.original_price && product.original_price > product.current_price;
                const totalStock = getTotalStock(product);
                const isUnlimited = product.unlimited_stock;
                const effectiveStock = isUnlimited ? 9999 : totalStock;
                const hasOptions = product.options && product.options.length > 0;
                const qty = getQuantity(product.id);

                return (
                  <div
                    key={product.id}
                    className={`group bg-white p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'flex flex-col gap-4'
                      : 'flex flex-row gap-4 sm:gap-6 items-center'
                      }`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/${store.slug}/p/${product.id}`}
                      onClick={() => setLoadingProductId(product.id)}
                      className={viewMode === 'list' ? 'shrink-0' : ''}
                    >
                      <div className={`relative overflow-hidden rounded-xl bg-gray-100 ${viewMode === 'grid'
                        ? 'w-full aspect-[4/5]'
                        : 'w-24 h-24 sm:w-32 sm:h-32'
                        }`}>
                        {(product.thumbnail_url || product.image_url) ? (
                          <Image
                            src={product.thumbnail_url || product.image_url!}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}

                        {/* Loading Overlay */}
                        {loadingProductId === product.id && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all duration-300">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}

                        {/* Price Badge */}
                        {viewMode === 'grid' && (
                          <div className="absolute bottom-3 left-3 bg-[#19e65e]/90 backdrop-blur-md text-[#111813] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                            <span className="text-sm font-bold">{t('storefront.price')} {product.current_price.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="text-xs line-through opacity-60">
                                {t('storefront.price')} {product.original_price!.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Out of stock overlay */}
                        {!isUnlimited && totalStock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{t('storefront.out_of_stock')}</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details Column */}
                    <div className={`flex flex-col ${viewMode === 'list' ? 'flex-1 items-center justify-center text-center px-2 min-w-0' : 'gap-3'}`}>
                      <div>
                        <Link
                          href={`/${store.slug}/p/${product.id}`}
                          onClick={() => setLoadingProductId(product.id)}
                        >
                          <h3 className="text-[#111813] text-lg font-medium leading-tight hover:text-[#19e65e] transition-colors truncate w-full">
                            {product.name}
                          </h3>
                        </Link>
                        {product.description && (
                          <p className={`text-gray-500 mt-1 line-clamp-1 ${viewMode === 'list' ? 'text-sm' : 'text-xs'}`}>
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* List View: Price in Middle Column */}
                      {viewMode === 'list' && (
                        <div className="flex flex-col items-center mt-2">
                          <span className="font-bold text-2xl text-[#111813]">
                            {product.current_price.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500 mr-1">{t('common.currency')}</span>
                          </span>
                          {hasDiscount && (
                            <span className="text-xs line-through text-gray-400">
                              {product.original_price!.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className={`${viewMode === 'list' ? 'flex flex-col items-center justify-center gap-2 shrink-0' : 'flex items-center justify-between gap-3 mt-1'}`}>
                      {!hasOptions && (isUnlimited || totalStock > 0) && (
                        <>
                          {/* Quantity Selector */}
                          <div className={`flex items-center bg-gray-100 rounded-full px-1 ${viewMode === 'list' ? 'h-8 px-2 w-auto gap-2' : 'h-10'}`}>
                            <button
                              onClick={() => updateQuantity(product.id, viewMode === 'list' ? 1 : -1, effectiveStock)}
                              disabled={viewMode === 'list' && qty >= effectiveStock}
                              className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors ${viewMode === 'list' && qty >= effectiveStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {viewMode === 'list' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </button>
                            <span className={`text-center text-sm font-medium ${viewMode === 'list' ? '' : 'w-6'}`}>{qty}</span>
                            <button
                              onClick={() => updateQuantity(product.id, viewMode === 'list' ? -1 : 1, effectiveStock)}
                              disabled={viewMode === 'grid' && qty >= effectiveStock}
                              className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors ${viewMode === 'grid' && qty >= effectiveStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {viewMode === 'list' ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap px-4 ${viewMode === 'list'
                              ? 'h-9 w-auto'
                              : 'flex-1 h-10'
                              }`}
                          >
                            {t('storefront.add_to_cart')}
                          </button>
                        </>
                      )}

                      {hasOptions && (isUnlimited || totalStock > 0) && (
                        <Link
                          href={`/${store.slug}/p/${product.id}`}
                          onClick={() => setLoadingProductId(product.id)}
                          className={`bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center whitespace-nowrap px-4 ${viewMode === 'list'
                            ? 'h-9 w-auto'
                            : 'flex-1 h-10'
                            }`}
                        >
                          {t('storefront.select_options')}
                        </Link>
                      )}

                      {!isUnlimited && totalStock <= 0 && (
                        <button
                          disabled
                          className={`bg-gray-200 text-gray-500 rounded-full text-sm font-medium cursor-not-allowed whitespace-nowrap px-4 ${viewMode === 'list'
                            ? 'h-9 w-auto'
                            : 'flex-1 h-10'
                            }`}
                        >
                          {t('storefront.out_of_stock')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-100 py-10">
        <div className="flex flex-col gap-6 px-5 text-center items-center">
          <p className="text-gray-400 text-xs">
            {t('common.copyright', { year: new Date().getFullYear(), storeName: store.name })}
          </p>
        </div>
      </footer>

      {/* Powered by WhatSou - Fixed Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="flex items-center justify-center h-12 px-6 gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 active:scale-95">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm">{t('common.powered_by')}</span>
        </button>
      </div>

      {/* Cart Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center justify-center h-14 w-auto px-4 sm:px-6 gap-3 rounded-full bg-[#19e65e] text-[#111813] shadow-lg hover:bg-[#19e65e]/90 transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="font-bold">{t('storefront.items_count', { count: totalItems })}</span>
          )}
        </button>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        store={store}
      />
    </div>
  );
}
