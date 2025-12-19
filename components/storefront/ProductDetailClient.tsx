'use client';

import { useState } from 'react';
import { Store, Product } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { useRouter } from 'next/navigation';
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
  const { addItem, totalItems } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const hasDiscount = product.original_price && product.original_price > product.current_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.current_price) / product.original_price!) * 100)
    : 0;

  const allOptionsSelected = () => {
    if (!product.options || product.options.length === 0) return true;
    return product.options.every((option) => selectedOptions[option.name]);
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

    addItem({
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: product.current_price,
      selected_options: selectedOptions,
      image_url: product.image_url,
    });

    toast({
      title: 'Added to cart!',
      description: `${quantity} ${product.name} added to your cart`,
    });

    setShowCart(true);
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
                ${product.current_price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-2xl text-gray-400 line-through">
                  ${product.original_price!.toFixed(2)}
                </span>
              )}
            </div>

            {product.quantity > 0 ? (
              <p className="text-lg text-gray-600">
                {product.quantity} items in stock
              </p>
            ) : (
              <p className="text-lg text-red-500 font-semibold">Out of stock</p>
            )}

            {product.options && product.options.length > 0 && (
              <div className="space-y-6 pt-6 border-t">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [option.name]: value,
                            }))
                          }
                          className={`px-6 py-3 rounded-3xl border-2 font-medium transition-all ${
                            selectedOptions[option.name] === value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
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
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  variant="outline"
                  size="icon"
                  className="rounded-2xl w-12 h-12"
                  disabled={quantity >= product.quantity}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="w-full h-16 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              Add to Cart
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
