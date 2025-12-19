'use client';

import { Product } from '@/lib/types/database';
import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  storeSlug: string;
}

export default function ProductGrid({ products, storeSlug }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const hasDiscount = product.original_price && product.original_price > product.current_price;
        const discountPercent = hasDiscount
          ? Math.round(((product.original_price! - product.current_price) / product.original_price!) * 100)
          : 0;

        return (
          <Link
            key={product.id}
            href={`/${storeSlug}/p/${product.id}`}
            className="group"
          >
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-4">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-20 h-20 text-gray-400" />
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
                  ${product.current_price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.original_price!.toFixed(2)}
                  </span>
                )}
              </div>

              {product.quantity > 0 ? (
                <p className="text-sm text-gray-500">{product.quantity} in stock</p>
              ) : (
                <p className="text-sm text-red-500 font-medium">Out of stock</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
