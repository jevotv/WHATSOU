'use client';

import { useState } from 'react';
import { Store, Product } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { ShoppingCart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';

interface StorefrontClientProps {
  store: Store;
  products: Product[];
}

export default function StorefrontClient({ store, products }: StorefrontClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const { totalItems } = useCart();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} products available
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <div className="bg-green-500 text-white rounded-full p-4 hover:bg-green-600 transition-all hover:scale-105">
                <ShoppingCart className="w-6 h-6" />
              </div>
              {totalItems > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-3xl border-2 text-base"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} storeSlug={store.slug} />
        )}
      </main>

      <CartDrawer
        open={showCart}
        onClose={() => setShowCart(false)}
        store={store}
      />
    </div>
  );
}
