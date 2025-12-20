'use client';

import { useState, useEffect } from 'react';
import { Store, Product, ProductVariant } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import CartDrawer from './CartDrawer';

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
      setVariants(data);
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
        ([key, value]) => v.option_values[key] === value
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
    if (selectedVariant) return selectedVariant.quantity;
    if (hasOptions && variants.length > 0) {
      // If has variants but none selected, show total stock
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
    if (effectiveStock <= 0) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (!allOptionsSelected()) {
      toast({
        title: 'Please select all options',
        description: 'You must choose a value for each option',
        variant: 'destructive',
      });
      return;
    }

    if (hasOptions && variants.length > 0 && !selectedVariant) {
      toast({
        title: 'Variant not available',
        description: 'This combination is not available',
        variant: 'destructive',
      });
      return;
    }

    // Validate stock
    if (quantity > effectiveStock) {
      toast({
        title: 'Not enough stock',
        description: `Only ${effectiveStock} available`,
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
      image_url: product.image_url,
    });

    toast({
      title: 'Added to cart!',
      description: `${quantity} ${product.name} added to your cart`,
    });

    setShowCart(true);
  };

  // Check if an option value is available (has at least one variant with stock)
  const isOptionValueAvailable = (optionName: string, value: string) => {
    if (!hasOptions || variants.length === 0) return true;

    return variants.some((v) => {
      if (v.option_values[optionName] !== value) return false;
      if (v.quantity <= 0) return false;

      // Check if compatible with other selected options
      for (const [key, selectedValue] of Object.entries(selectedOptions)) {
        if (key !== optionName && v.option_values[key] !== selectedValue) {
          return false;
        }
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <div className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600 transition-all hover:scale-105">
                <ShoppingCart className="w-5 h-5" />
              </div>
              {totalItems > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <Package className="w-32 h-32 text-gray-400" />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                -{discountPercent}%
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-gray-900">
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-2xl text-gray-400 line-through">
                  ${product.original_price!.toFixed(2)}
                </span>
              )}
              {hasOptions && !allOptionsSelected() && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Starting from
                </span>
              )}
            </div>

            {effectiveStock > 0 ? (
              <p className="text-lg text-gray-600">
                {effectiveStock} items in stock
              </p>
            ) : (
              <p className="text-lg text-red-500 font-semibold">
                {hasOptions && !allOptionsSelected() ? 'Select options to see availability' : 'Out of stock'}
              </p>
            )}

            {hasOptions && (
              <div className="space-y-6 pt-6 border-t">
                {product.options!.map((option) => (
                  <div key={option.name}>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => {
                        const isAvailable = isOptionValueAvailable(option.name, value);
                        const isSelected = selectedOptions[option.name] === value;

                        return (
                          <button
                            key={value}
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.name]: value,
                              }))
                            }
                            disabled={!isAvailable}
                            className={`px-6 py-3 rounded-3xl border-2 font-medium transition-all ${isSelected
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : isAvailable
                                ? 'border-gray-200 hover:border-gray-300'
                                : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                              }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Show selected variant info */}
                {selectedVariant && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-green-800 font-medium">
                      ✓ {Object.values(selectedVariant.option_values).join(' / ')} - ${selectedVariant.price.toFixed(2)}
                    </p>
                    <p className="text-green-600 text-sm">
                      {selectedVariant.quantity} in stock
                    </p>
                  </div>
                )}

                {/* Show if combination doesn't exist */}
                {allOptionsSelected() && hasOptions && variants.length > 0 && !selectedVariant && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-800 font-medium">
                      ✗ This combination is not available
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-6 border-t">
              <label className="block text-lg font-semibold text-gray-900">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  size="icon"
                  className="rounded-2xl w-12 h-12"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-2xl font-bold w-16 text-center">
                  {quantity}
                </span>
                <Button
                  onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                  variant="outline"
                  size="icon"
                  className="rounded-2xl w-12 h-12"
                  disabled={quantity >= effectiveStock}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className="w-full h-16 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold disabled:opacity-50"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              {!allOptionsSelected()
                ? 'Select Options'
                : effectiveStock <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </main>

      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        store={store}
      />
    </div>
  );
}
