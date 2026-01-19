'use client';

import { useState } from 'react';
import { Product } from '@/lib/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Loader2 } from 'lucide-react';
import { useLanguage } from '@whatsou/shared';

interface ProductGridProps {
  products: Product[];
  storeSlug: string;
}

export default function ProductGrid({ products, storeSlug }: ProductGridProps) {
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const hasDiscount = product.original_price && product.original_price > product.current_price;
        const discountPercent = hasDiscount
          ? Math.round(((product.original_price! - product.current_price) / product.original_price!) * 100)
          : 0;

        // Calculate total stock from variants if they exist
        const hasVariants = product.variants && product.variants.length > 0;
        const totalStock = hasVariants
          ? product.variants!.reduce((sum, v) => sum + v.quantity, 0)
          : product.quantity;

        const isUnlimited = product.unlimited_stock;

        return (
          <Link
            key={product.id}
            href={`/${storeSlug}/p/${product.id}`}
            onClick={() => setLoadingProductId(product.id)}
            className="group"
          >
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-4">
              {(product.thumbnail_url || product.image_url) ? (
                <Image
                  src={product.thumbnail_url || product.image_url!}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-20 h-20 text-gray-400" />
                </div>
              )}

              {/* Loading Overlay */}
              {loadingProductId === product.id && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-all duration-300">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}

              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  EGP {product.current_price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    EGP {product.original_price!.toFixed(2)}
                  </span>
                )}
              </div>

              {isUnlimited ? (
                <p className="text-sm text-green-600 font-medium">{t('storefront.in_stock')}</p>
              ) : totalStock > 0 ? (
                <p className="text-sm text-gray-500">{t('storefront.items_in_stock', { count: totalStock })}</p>
              ) : (
                <p className="text-sm text-red-500 font-medium">{t('storefront.out_of_stock')}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
