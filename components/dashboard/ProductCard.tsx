'use client';

import { Product } from '@/lib/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const hasDiscount = product.original_price && product.original_price > product.current_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.current_price) / product.original_price!) * 100)
    : 0;

  // Calculate total stock: use variants if they exist, otherwise use product quantity
  const hasVariants = product.variants && product.variants.length > 0;
  const totalStock = hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.quantity, 0)
    : product.quantity;

  return (
    <Card className="rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group">
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button
            size="icon"
            onClick={() => onEdit(product)}
            className="rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={() => onDelete(product.id)}
            variant="destructive"
            className="rounded-full shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600">
            ${product.current_price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${product.original_price!.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Stock: {totalStock}
            {hasVariants && <span className="text-xs ml-1">({product.variants!.length} variants)</span>}
          </span>
          {product.category && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {product.category}
            </span>
          )}
        </div>
        {product.options && product.options.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              {product.options.length} option{product.options.length > 1 ? 's' : ''} available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
