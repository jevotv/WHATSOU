'use client';

import { useState, useEffect } from 'react';
import { Store, Product, ProductVariant } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, Zap, Check } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import CartDrawer from './CartDrawer';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import AdminBar from './AdminBar';

interface ProductDetailClientProps {
  store: Store;
  product: Product;
}

export default function ProductDetailClient({ store, product }: ProductDetailClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { addItem, totalItems } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const isOwner = user?.id === store.user_id;

  const hasOptions = product.options && product.options.length > 0;
  const hasDiscount = product.original_price && product.original_price > product.current_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.current_price) / product.original_price!) * 100)
    : 0;

  // Load variants when product has options
  useEffect(() => {
    if (hasOptions) {
      loadVariants();
    }
  }, [product.id, hasOptions]);

  const loadVariants = async () => {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id);

    if (data) {
      // Convert option_values to strings to ensure proper comparison
      const processedVariants = data.map((v: ProductVariant) => ({
        ...v,
        option_values: Object.fromEntries(
          Object.entries(v.option_values || {}).map(([k, val]) => [String(k), String(val)])
        )
      }));
      setVariants(processedVariants);
    }
  };

  // Find matching variant when options change
  useEffect(() => {
    if (!hasOptions || variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    const allSelected = product.options!.every((opt) => selectedOptions[opt.name]);
    if (!allSelected) {
      setSelectedVariant(null);
      return;
    }

    // Find matching variant
    const match = variants.find((v) => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => String(v.option_values[key] || '') === String(value)
      );
    });

    setSelectedVariant(match || null);
  }, [selectedOptions, variants, hasOptions, product.options]);

  // Calculate effective price and stock
  const getEffectivePrice = () => {
    if (selectedVariant) return selectedVariant.price;
    return product.current_price;
  };

  const getEffectiveStock = () => {
    if (product.unlimited_stock) return 999999;
    if (selectedVariant) {
      if (selectedVariant.unlimited_stock) return 999999;
      return selectedVariant.quantity;
    }
    if (hasOptions && variants.length > 0) {
      return variants.reduce((sum, v) => sum + v.quantity, 0);
    }
    return product.quantity;
  };

  const effectivePrice = getEffectivePrice();
  const effectiveStock = getEffectiveStock();

  const allOptionsSelected = () => {
    if (!hasOptions) return true;
    return product.options!.every((option) => selectedOptions[option.name]);
  };

  const canAddToCart = () => {
    if (!allOptionsSelected()) return false;
    if (hasOptions && variants.length > 0 && !selectedVariant) return false;
    if (!product.unlimited_stock && effectiveStock <= 0) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (!allOptionsSelected()) {
      toast({
        title: t('storefront.missing_options'),
        description: t('storefront.missing_options_desc'),
        variant: 'destructive',
      });
      return;
    }

    if (hasOptions && variants.length > 0 && !selectedVariant) {
      toast({
        title: t('storefront.variant_unavailable'),
        description: t('storefront.variant_unavailable'),
        variant: 'destructive',
      });
      return;
    }

    // Validate stock
    if (!product.unlimited_stock && quantity > effectiveStock) {
      toast({
        title: t('storefront.not_enough_stock'),
        description: t('storefront.not_enough_stock_desc', { count: effectiveStock }),
        variant: 'destructive',
      });
      return;
    }

    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id,
      product_name: product.name,
      quantity,
      price: effectivePrice,
      selected_options: selectedOptions,
      image_url: product.thumbnail_url || product.image_url,
    });

    toast({
      title: t('storefront.added_to_cart'),
      description: t('storefront.added_to_cart_desc', { quantity, name: product.name }),
    });

    setShowCart(true);
  };

  // Check if an option value is available (has at least one variant with stock)
  const isOptionValueAvailable = (optionName: string, value: string) => {
    if (!hasOptions || variants.length === 0) return true;

    return variants.some((v) => {
      if (String(v.option_values[optionName] || '') !== String(value)) return false;
      if (!v.unlimited_stock && v.quantity <= 0) return false;

      // Check if compatible with other selected options
      for (const [key, selectedValue] of Object.entries(selectedOptions)) {
        if (key !== optionName && String(v.option_values[key] || '') !== String(selectedValue)) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] pb-24">
      {/* Admin Bar */}
      {!loading && isOwner && <AdminBar />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-[#111813] transition group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </div>
              <span className="font-bold hidden sm:inline">{t('common.back')}</span>
            </button>
            <h1 className="text-lg font-bold text-[#111813] truncate max-w-[200px] sm:max-w-md">
              {store.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={`${product.name} | ${store.name}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <Package className="w-32 h-32 text-gray-300" />
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {hasDiscount && (
                <div className="bg-[#E4405F] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  -{discountPercent}%
                </div>
              )}
              {(product.unlimited_stock || effectiveStock > 0) ? (
                <div className="bg-[#19e65e] text-[#111813] px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#111813] animate-pulse"></div>
                  {t('storefront.in_stock')}
                </div>
              ) : (
                <div className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {t('storefront.out_of_stock')}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 h-full">
              <div className="space-y-6">

                {/* Title & Price */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111813] mb-4 leading-tight">
                    {product.name}
                  </h1>

                  {hasOptions && !allOptionsSelected() && (
                    <p className="text-sm text-gray-500 mb-1 font-medium">
                      {t('storefront.starting_from')}
                    </p>
                  )}

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl font-black text-[#111813]">
                      {effectivePrice.toFixed(0)} <span className="text-lg font-bold text-gray-500">{t('common.currency')}</span>
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-gray-400 line-through font-medium">
                        {product.original_price!.toFixed(0)} <span className="text-sm">{t('common.currency')}</span>
                      </span>
                    )}
                  </div>


                </div>

                {product.description && (
                  <div className="prose prose-sm sm:prose-base text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
                    <p>{product.description}</p>
                  </div>
                )}

                {/* Options Selection */}
                {hasOptions && (
                  <div className="space-y-6 pt-6 border-t border-gray-100">
                    {product.options!.map((option) => (
                      <div key={option.name}>
                        <label className="block text-sm font-bold text-[#111813] uppercase tracking-wide mb-3">
                          {option.name}
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {option.values.map((value) => {
                            const isAvailable = isOptionValueAvailable(option.name, value);
                            const isSelected = selectedOptions[option.name] === value;

                            return (
                              <button
                                key={value}
                                onClick={() =>
                                  setSelectedOptions((prev) => {
                                    if (prev[option.name] === value) {
                                      const newState = { ...prev };
                                      delete newState[option.name];
                                      return newState;
                                    }
                                    return {
                                      ...prev,
                                      [option.name]: value,
                                    };
                                  })
                                }
                                disabled={!isAvailable}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${isSelected
                                  ? 'border-[#19e65e] bg-[#19e65e]/10 text-[#111813] shadow-sm'
                                  : isAvailable
                                    ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed decoration-slice'
                                  }`}
                              >
                                {value}
                                {isSelected && <Check className="w-3.5 h-3.5 inline-block ml-1.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Variant Status */}
                    {selectedVariant ? (
                      <div className="bg-[#19e65e]/10 border border-[#19e65e]/20 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#19e65e] flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-[#111813]" />
                        </div>
                        <div>
                          <p className="text-[#111813] font-bold text-sm">
                            {t('storefront.variant_selected', { options: Object.values(selectedVariant.option_values || {}).map(v => String(v)).join(' / '), price: selectedVariant.price.toFixed(2) })}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {selectedVariant.unlimited_stock ? t('storefront.in_stock') : t('storefront.items_in_stock', { count: selectedVariant.quantity })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      allOptionsSelected() && hasOptions && variants.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 font-medium text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          {t('storefront.variant_unavailable')}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Quantity & Action */}
                <div className="space-y-4 pt-6 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#111813] uppercase tracking-wide">{t('storefront.quantity')}</span>
                  </div>

                  <div className="flex gap-3 sm:gap-4">
                    {/* Usage of consistent Quantity styling from StorefrontClient/Globals could be nice, but matching style manually here */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1 h-16 border border-gray-200 min-w-[130px] sm:min-w-[160px] shrink-0">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 sm:w-16 h-full flex items-center justify-center rounded-full bg-white shadow-sm text-[#111813] hover:bg-gray-50 active:scale-95 transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="flex-1 text-center text-xl font-bold text-[#111813]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                        disabled={!product.unlimited_stock && quantity >= effectiveStock}
                        className={`w-12 sm:w-16 h-full flex items-center justify-center rounded-full bg-white shadow-sm text-[#111813] hover:bg-gray-50 active:scale-95 transition-all ${!product.unlimited_stock && quantity >= effectiveStock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart()}
                      className="flex-1 h-16 rounded-full bg-[#111813] hover:bg-black text-white text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2.5" />
                      {!allOptionsSelected()
                        ? t('storefront.select_options')
                        : effectiveStock <= 0 && !product.unlimited_stock
                          ? t('storefront.out_of_stock')
                          : t('storefront.add_to_cart')}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Powered by WhatSou - Fixed Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex">
        <a
          href="https://www.whatsou.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center h-12 px-5 gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 active:scale-95"
        >
          <Zap className="w-4 h-4" />
          <span className="font-bold text-sm">{t('common.powered_by')}</span>
        </a>
      </div>

      {/* Floating Cart Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center justify-center h-14 w-auto px-6 gap-3 rounded-full bg-[#19e65e] text-[#111813] shadow-[0_8px_30px_rgb(25,230,94,0.3)] hover:shadow-[0_8px_40px_rgb(25,230,94,0.4)] hover:bg-[#19e65e]/90 transition-all hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="font-exrabold text-lg">{totalItems}</span>
          )}
        </button>
      </div>

      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        store={store}
      />
    </div >
  );
}
