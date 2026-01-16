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
import { Globe, Facebook, Instagram, Twitter, Filter, ArrowUpDown, Tag } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductFilters from './ProductFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const param = searchParams.get('category');
    // Normalize 'All' from URL or default to current language's 'All'
    if (param === 'All' || param === 'الكل') return t('storefront.all_categories');
    return param || t('storefront.all_categories');
  });

  // When language changes, update 'All' category text if currently selected
  useEffect(() => {
    if (['All', 'الكل'].includes(selectedCategory)) {
      setSelectedCategory(t('storefront.all_categories'));
    }
  }, [language, t, selectedCategory]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // List of tracking/analytics parameters to ignore (not product filters)
  const IGNORED_PARAMS = [
    // Facebook
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
    // Google Analytics / Ads
    'gclid', 'dclid', 'gclsrc', 'gad_source', 'gbraid', 'wbraid',
    // UTM parameters
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
    // Microsoft/Bing
    'msclkid',
    // Twitter
    'twclid',
    // TikTok
    'ttclid',
    // LinkedIn
    'li_fat_id',
    // Pinterest
    'epik',
    // Email marketing
    'mc_cid', 'mc_eid',
    // Other common tracking params
    '_ga', '_gl', 'ref', 'source', 'campaign', 'affiliate', 'partner'
  ];

  // Filter State
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>(() => {
    const attrs: { [key: string]: string[] } = {};
    const knownParams = ['category', 'q', 'sort', 'min_price', 'max_price'];
    searchParams.forEach((value, key) => {
      // Skip known filter params
      if (knownParams.includes(key)) return;
      // Skip tracking/analytics params
      if (IGNORED_PARAMS.includes(key.toLowerCase())) return;
      // Skip params that start with common tracking prefixes
      if (key.startsWith('_') || key.startsWith('fb') || key.startsWith('utm_')) return;
      // Assume attributes are passed as key=val1,val2
      attrs[key] = value.split(',');
    });
    return attrs;
  });

  const [sortOption, setSortOption] = useState<string>(searchParams.get('sort') || 'newest'); // price_asc, price_desc, newest, best_selling

  // Data Extraction
  const { attributes, maxPrice, minPrice } = useMemo(() => {
    // Map of DisplayName -> Set of Values
    // We normalize keys (lowercase, trimmed) to find if they are the same attribute
    // but we keep the "prettiest" display name (e.g. Title Case or first seen)
    const attrsMap: { [normalizedKey: string]: { name: string; values: Set<string> } } = {};
    let max = 0;
    let min = Infinity;

    // Helper to format/normalize keys
    const normalize = (s: string) => s.trim().toLowerCase();
    const toTitleCase = (s: string) => s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    products.forEach((p) => {
      // Attributes
      p.options?.forEach((opt) => {
        const rawName = opt.name.trim();
        const key = normalize(rawName);

        if (!attrsMap[key]) {
          attrsMap[key] = {
            name: toTitleCase(rawName), // Default to Title Case for new attributes
            values: new Set()
          };
        }

        opt.values.forEach((v) => attrsMap[key].values.add(v.trim()));
      });

      // Price
      if (p.current_price > max) max = p.current_price;
      if (p.current_price < min) min = p.current_price;
    });

    if (min === Infinity) min = 0;

    return {
      attributes: Object.values(attrsMap).map((attr) => ({
        name: attr.name,
        values: Array.from(attr.values),
      })),
      maxPrice: max,
      minPrice: min,
    };
  }, [products]);

  // Map selected attributes using the normalized names matching the display names
  // We need to ensure we filter using the same logic


  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : minPrice;
    const max = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : maxPrice;
    return [Math.max(min, minPrice), Math.min(max, maxPrice)] as [number, number];
  });

  // Update price range when products change (e.g. initial load if default)
  useEffect(() => {
    if (!searchParams.get('min_price') && !searchParams.get('max_price')) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, searchParams]);

  // Set default view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setViewMode('list');
      } else {
        setViewMode('grid');
      }
    };
    handleResize();
  }, []);

  const { addItem, totalItems, totalPrice } = useCart();
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

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();

    // Only set category param if it's NOT the default 'All' (in any language)
    const allString = t('storefront.all_categories');
    if (selectedCategory && selectedCategory !== allString && selectedCategory !== 'All' && selectedCategory !== 'الكل') {
      params.set('category', selectedCategory);
    }
    if (searchQuery) params.set('q', searchQuery);
    if (sortOption && sortOption !== 'newest') params.set('sort', sortOption);

    if (priceRange[0] > minPrice) params.set('min_price', priceRange[0].toString());
    if (priceRange[1] < maxPrice) params.set('max_price', priceRange[1].toString());

    Object.entries(selectedAttributes).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, searchQuery, sortOption, priceRange, selectedAttributes, minPrice, maxPrice, pathname, router, t]);

  // Handlers
  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes(prev => {
      const current = prev[name] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      // Cleanup empty keys
      if (updated.length === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: updated };
    });
  };

  const clearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedAttributes({});
    setSortOption('newest');
    // Ensure URL is cleared via effect
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...availableProducts];

    // Filter by category
    const allString = t('storefront.all_categories');
    if (selectedCategory && selectedCategory !== allString && selectedCategory !== 'All' && selectedCategory !== 'الكل') {
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

    // Filter by Price Range
    filtered = filtered.filter(p => p.current_price >= priceRange[0] && p.current_price <= priceRange[1]);

    // Filter by Attributes
    Object.entries(selectedAttributes).forEach(([attrName, selectedValues]) => {
      if (selectedValues.length === 0) return;

      filtered = filtered.filter((p) => {
        const normalize = (s: string) => s.trim().toLowerCase();

        // Find product option variant that matches (case-insensitive)
        const productOption = p.options?.find((o) => normalize(o.name) === normalize(attrName));

        if (!productOption) return false;

        // Also check values case-insensitive/trimmed just in case
        return productOption.values.some((v) =>
          selectedValues.some(sv => v.trim() === sv.trim())
        );
      });
    });

    // Sort
    if (sortOption === 'price_asc') {
      filtered.sort((a, b) => a.current_price - b.current_price);
    } else if (sortOption === 'price_desc') {
      filtered.sort((a, b) => b.current_price - a.current_price);
    } else if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'best_selling') {
      filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    }

    return filtered;
  }, [availableProducts, selectedCategory, searchQuery, priceRange, selectedAttributes, sortOption, t]);

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

    const currentTotal = totalPrice + (product.current_price * qty);
    const threshold = store.free_shipping_threshold;
    let description = t('storefront.added_to_cart_desc', { quantity: qty, name: product.name });

    // Add free shipping nudges
    if (threshold && currentTotal < threshold) {
      const remaining = threshold - currentTotal;
      const msg = direction === 'rtl'
        ? `\nمتبقي ${remaining.toFixed(2)} ${t('common.currency')} للشحن المجاني!`
        : `\nAdd ${remaining.toFixed(2)} ${t('common.currency')} more for free shipping!`;
      description += msg;
    } else if (threshold && currentTotal >= threshold && totalPrice < threshold) {
      const msg = direction === 'rtl'
        ? `\n🎉 مبروك! لقد حصلت على شحن مجاني!`
        : `\n🎉 Hooray! You unlocked free shipping!`;
      description += msg;
    }

    toast({
      title: t('storefront.added_to_cart'),
      description: description,
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
      {/* Free Shipping Marquee */}
      {store.free_shipping_threshold && (
        <div className="bg-[#008069] text-white py-2 overflow-hidden whitespace-nowrap relative z-50">
          <div className={`inline-block ${direction === 'rtl' ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <span key={i} className="inline-block px-8 font-medium text-sm">
                {direction === 'rtl'
                  ? `📦 شحن مجاني عند الشراء بـ ${store.free_shipping_threshold} ${t('common.currency')}`
                  : `📦 Free shipping on orders over ${store.free_shipping_threshold} ${t('common.currency')}`}
              </span>
            ))}
          </div>
        </div>
      )}

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
              <div className="relative h-24 w-24 rounded-full ring-4 ring-[#19e65e]/10 overflow-hidden bg-white shadow-sm flex items-center justify-center">
                {store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name + ' - Logo'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <Image
                      src="/logo.png"
                      alt={store.name + ' - Logo'}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
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
            {/* Search Bar & Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={t('storefront.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-11 rounded-xl border-gray-200 focus:ring-2 focus:ring-[#19e65e] text-base bg-white"
                  />
                </div>

                {/* Filter Button */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className={`flex items-center justify-center gap-2 px-4 rounded-xl border transition-all h-11 shrink-0 ${Object.keys(selectedAttributes).length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice
                    ? 'border-[#19e65e] text-[#19e65e] bg-[#19e65e]/5'
                    : 'border-gray-200 hover:border-[#19e65e] hover:text-[#19e65e] bg-white text-gray-700'
                    }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline font-bold">{t('storefront.filters')}</span>
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                {/* Sort Dropdown */}
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200 bg-white shrink-0">
                    <div className="flex items-center gap-2 text-gray-700">
                      <ArrowUpDown className="w-4 h-4" />
                      <span className="truncate font-medium">
                        {sortOption === 'price_asc' && t('storefront.sort_price_asc')}
                        {sortOption === 'price_desc' && t('storefront.sort_price_desc')}
                        {sortOption === 'newest' && t('storefront.sort_newest')}
                        {sortOption === 'best_selling' && t('storefront.sort_best_selling')}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('storefront.sort_newest')}</SelectItem>
                    <SelectItem value="best_selling">{t('storefront.sort_best_selling')}</SelectItem>
                    <SelectItem value="price_asc">{t('storefront.sort_price_asc')}</SelectItem>
                    <SelectItem value="price_desc">{t('storefront.sort_price_desc')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggles */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0 h-11">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#111813]' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#111813]' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (selectedCategory === category && category !== t('storefront.all_categories')) {
                      setSelectedCategory(t('storefront.all_categories'));
                    } else {
                      setSelectedCategory(category);
                    }
                  }}
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
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('storefront.no_products_found')}</h3>
              <p className="text-gray-500 max-w-sm mb-8">{t('storefront.no_products_found_desc')}</p>

              <Button
                onClick={clearAllFilters}
                className="bg-[#111813] hover:bg-black text-white h-11 px-6 rounded-full"
              >
                {t('storefront.clear_filters')}
              </Button>
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
                    className={`group relative bg-white transition-all duration-300 hover:shadow-lg ${viewMode === 'grid'
                      ? 'p-4 rounded-2xl shadow-sm flex flex-col gap-4'
                      : 'p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden'
                      }`}
                  >

                    {/* --- LIST VIEW CUSTOM LAYOUT --- */}
                    {viewMode === 'list' && (
                      <div className="flex flex-col w-full">
                        {/* Top: Image + Text */}
                        <div className="flex items-start gap-3 w-full">
                          {/* Image */}
                          <div className="relative shrink-0">
                            <Link
                              href={`/${store.slug}/p/${product.id}`}
                              onClick={() => setLoadingProductId(product.id)}
                            >
                              <div className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 relative">
                                {(product.thumbnail_url || product.image_url) ? (
                                  <Image
                                    src={product.thumbnail_url || product.image_url!}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package size={24} strokeWidth={1.5} />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </div>

                          {/* Name & Desc */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <Link
                                href={`/${store.slug}/p/${product.id}`}
                                onClick={() => setLoadingProductId(product.id)}
                                className="w-full"
                              >
                                <h3 className="text-[#111813] font-bold text-sm sm:text-base leading-tight truncate w-full group-hover:text-[#19e65e] transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                            </div>
                            {product.description && (
                              <p className="text-gray-400 text-[11px] sm:text-xs mt-1 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-3 border-t border-gray-50"></div>

                        {/* Bottom: Price + Actions */}
                        <div className="flex items-center justify-between mt-auto">
                          {/* Price */}
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-base sm:text-xl font-black text-[#111813]">
                                {product.current_price.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">{t('common.currency')}</span>
                            </div>
                            {hasDiscount && (
                              <span className="text-[10px] line-through text-gray-300">
                                {product.original_price!.toFixed(2)} {t('common.currency')}
                              </span>
                            )}
                          </div>

                          {/* Actions Group */}
                          <div className="flex items-center gap-2">
                            {/* Quantity Selector */}
                            {!hasOptions && (isUnlimited || totalStock > 0) && (
                              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-100">
                                <button
                                  onClick={() => updateQuantity(product.id, -1, effectiveStock)}
                                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all active:scale-90"
                                >
                                  <Minus size={12} className="text-gray-600" />
                                </button>
                                <span className="w-6 text-center font-bold text-xs text-[#111813]">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, 1, effectiveStock)}
                                  disabled={qty >= effectiveStock}
                                  className={`w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 transition-all active:scale-90 ${qty >= effectiveStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Plus size={12} className="text-gray-600" />
                                </button>
                              </div>
                            )}

                            {/* Add Button / Options / Out Stock */}
                            {!hasOptions && (isUnlimited || totalStock > 0) && (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="flex items-center justify-center gap-1.5 bg-[#111813] text-white h-8 px-3 rounded-lg font-bold text-[11px] sm:text-xs hover:bg-black transition-all active:scale-95 shrink-0 shadow-sm"
                              >
                                <ShoppingCart size={13} />
                                <span>{t('storefront.add_to_cart')}</span>
                              </button>
                            )}

                            {hasOptions && (isUnlimited || totalStock > 0) && (
                              <Link
                                href={`/${store.slug}/p/${product.id}`}
                                onClick={() => setLoadingProductId(product.id)}
                                className="flex items-center justify-center gap-1.5 bg-[#111813] text-white h-8 px-3 rounded-lg font-bold text-[11px] sm:text-xs hover:bg-black transition-all active:scale-95 shrink-0 shadow-sm"
                              >
                                <span>{t('storefront.select_options')}</span>
                              </Link>
                            )}

                            {!isUnlimited && totalStock <= 0 && (
                              <button
                                disabled
                                className="flex items-center justify-center gap-1.5 bg-gray-200 text-gray-500 h-8 px-3 rounded-lg font-bold text-[11px] sm:text-xs cursor-not-allowed shrink-0"
                              >
                                <span>{t('storefront.out_of_stock')}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}


                    {/* --- GRID VIEW LAYOUT (Original) --- */}
                    {viewMode === 'grid' && (
                      <>
                        {/* Product Image */}
                        <Link
                          href={`/${store.slug}/p/${product.id}`}
                          onClick={() => setLoadingProductId(product.id)}
                        >
                          <div className="relative overflow-hidden rounded-xl bg-gray-100 w-full aspect-[4/5]">
                            {(product.thumbnail_url || product.image_url) ? (
                              <Image
                                src={product.thumbnail_url || product.image_url!}
                                alt={`${product.name} | ${store.name}`}
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
                            <div className="absolute bottom-3 left-3 bg-[#19e65e]/90 backdrop-blur-md text-[#111813] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                              <span className="text-sm font-bold">{t('storefront.price')} {product.current_price.toFixed(2)}</span>
                              {hasDiscount && (
                                <span className="text-xs line-through opacity-60">
                                  {product.original_price!.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Out of stock overlay */}
                            {!isUnlimited && totalStock <= 0 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{t('storefront.out_of_stock')}</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex flex-col gap-3">
                          <Link
                            href={`/${store.slug}/p/${product.id}`}
                            onClick={() => setLoadingProductId(product.id)}
                          >
                            <h3 className="text-[#111813] text-lg font-medium leading-tight hover:text-[#19e65e] transition-colors truncate w-full">
                              {product.name}
                            </h3>
                          </Link>
                          {product.description && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                              {product.description}
                            </p>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-3 mt-1">
                            {!hasOptions && (isUnlimited || totalStock > 0) && (
                              <>
                                <div className="flex items-center bg-gray-100 rounded-full h-10 px-1">
                                  <button
                                    onClick={() => updateQuantity(product.id, -1, effectiveStock)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                  <button
                                    onClick={() => updateQuantity(product.id, 1, effectiveStock)}
                                    disabled={qty >= effectiveStock}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors ${qty >= effectiveStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="flex-1 h-10 bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                  {t('storefront.add_to_cart')}
                                </button>
                              </>
                            )}

                            {hasOptions && (isUnlimited || totalStock > 0) && (
                              <Link
                                href={`/${store.slug}/p/${product.id}`}
                                onClick={() => setLoadingProductId(product.id)}
                                className="flex-1 h-10 bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                              >
                                {t('storefront.select_options')}
                              </Link>
                            )}

                            {!isUnlimited && totalStock <= 0 && (
                              <button
                                disabled
                                className="flex-1 h-10 bg-gray-200 text-gray-500 rounded-full text-sm font-medium cursor-not-allowed"
                              >
                                {t('storefront.out_of_stock')}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
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
        <a
          href="https://www.whatsou.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-12 px-6 gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 active:scale-95"
        >
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm">{t('common.powered_by')}</span>
        </a>
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

      {/* Product Filters Drawer */}
      <ProductFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        maxPrice={maxPrice}
        minPrice={minPrice}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        attributes={attributes}
        selectedAttributes={selectedAttributes}
        onAttributeChange={handleAttributeChange}
        onClearFilters={clearAllFilters}
      />

      {/* Cart Drawer */}
      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        store={store}
      />
    </div>
  );
}
