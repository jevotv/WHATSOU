'use client';

import { useState, useMemo } from 'react';
import { Store, Product } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCart, Minus, Plus, Package, Zap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import CartDrawer from './CartDrawer';
import { useToast } from '@/hooks/use-toast';

interface StorefrontClientProps {
  store: Store;
  products: Product[];
}

export default function StorefrontClient({ store, products }: StorefrontClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const { addItem, totalItems } = useCart();
  const { toast } = useToast();

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)] as string[];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
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
  }, [products, selectedCategory, searchQuery]);

  // Calculate total stock for a product
  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + v.quantity, 0);
    }
    return product.quantity;
  };

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
    if (qty > totalStock) {
      toast({
        title: 'Not enough stock',
        description: `Only ${totalStock} available`,
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
      image_url: product.image_url,
    });

    toast({
      title: 'Added to cart!',
      description: `${qty} ${product.name} added`,
    });

    // Reset quantity
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]">
      {/* Header */}
      <header className="bg-white w-full pt-8 pb-4 border-b border-gray-100">
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
                    <span className="text-white text-3xl font-bold">
                      {store.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-center text-[#111813]">
                  {store.name}
                </h1>
                {store.description ? (
                  <p className="text-gray-500 text-sm font-normal mt-1 text-center max-w-md">
                    {store.description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm font-normal mt-1 text-center">
                    {products.length} products available
                  </p>
                )}

                {/* Social Media Icons */}
                {(store.facebook_url || store.instagram_url || store.twitter_url || store.tiktok_url) && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    {store.facebook_url && (
                      <a
                        href={store.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </a>
                    )}
                    {store.instagram_url && (
                      <a
                        href={store.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-gray-400 hover:text-pink-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.465C6.104 2.218 6.832 2.049 7.897 2c1.024-.047 1.379-.06 3.808-.06h.63zm2.595 14.053a4 4 0 10-5.82 0 4 4 0 005.82 0zM12 9a3 3 0 110 6 3 3 0 010-6zm5.5-4a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                        </svg>
                      </a>
                    )}
                    {store.twitter_url && (
                      <a
                        href={store.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {store.tiktok_url && (
                      <a
                        href={store.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="TikTok"
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                        </svg>
                      </a>
                    )}
                  </div>
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
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-11 rounded-full border-gray-200 focus:ring-2 focus:ring-[#19e65e] text-base"
              />
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
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const hasDiscount = product.original_price && product.original_price > product.current_price;
                const totalStock = getTotalStock(product);
                const hasOptions = product.options && product.options.length > 0;
                const qty = getQuantity(product.id);

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Product Image */}
                    <Link href={`/${store.slug}/p/${product.id}`}>
                      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute bottom-3 left-3 bg-[#19e65e]/90 backdrop-blur-md text-[#111813] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                          <span className="text-sm font-bold">${product.current_price.toFixed(2)}</span>
                          {hasDiscount && (
                            <span className="text-xs line-through opacity-60">
                              ${product.original_price!.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Out of stock overlay */}
                        {totalStock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex flex-col gap-3">
                      <div>
                        <Link href={`/${store.slug}/p/${product.id}`}>
                          <h3 className="text-[#111813] text-lg font-medium leading-tight hover:text-[#19e65e] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {product.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Quantity & Add to Cart */}
                      <div className="flex items-center justify-between gap-3 mt-1">
                        {!hasOptions && totalStock > 0 && (
                          <>
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-gray-100 rounded-full h-10 px-1">
                              <button
                                onClick={() => updateQuantity(product.id, -1, totalStock)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{qty}</span>
                              <button
                                onClick={() => updateQuantity(product.id, 1, totalStock)}
                                disabled={qty >= totalStock}
                                className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-gray-600 transition-colors ${qty >= totalStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 h-10 bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                              Add to Cart
                            </button>
                          </>
                        )}

                        {hasOptions && totalStock > 0 && (
                          <Link
                            href={`/${store.slug}/p/${product.id}`}
                            className="flex-1 h-10 bg-[#111813] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                          >
                            Select Options
                          </Link>
                        )}

                        {totalStock <= 0 && (
                          <button
                            disabled
                            className="flex-1 h-10 bg-gray-200 text-gray-500 rounded-full text-sm font-medium cursor-not-allowed"
                          >
                            Out of Stock
                          </button>
                        )}
                      </div>
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
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Powered by WhatSou - Fixed Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="flex items-center justify-center h-12 px-6 gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 active:scale-95">
          <Zap className="w-5 h-5" />
          <span className="font-bold text-sm">Powered by WhatSou</span>
        </button>
      </div>

      {/* Cart Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center justify-center h-14 w-14 sm:w-auto sm:px-6 gap-3 rounded-full bg-[#19e65e] text-[#111813] shadow-lg hover:bg-[#19e65e]/90 transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="hidden sm:block font-bold">{totalItems} Items</span>
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
