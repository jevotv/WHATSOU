'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

type Product = {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    stock?: number;
};

interface ProductsResponse {
    products: Product[];
    error?: string;
}

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const loadProducts = useCallback(async () => {
        try {
            const result = await api.get<ProductsResponse>('/api/dashboard/products');
            if (result.products) {
                setProducts(result.products);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            loadProducts();
        }
    }, [user, authLoading, router, loadProducts]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f8f7]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">متجرك</h1>
                    <button
                        onClick={signOut}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        تسجيل خروج
                    </button>
                </div>
            </header>

            {/* Products */}
            <main className="p-4">
                <h2 className="text-lg font-bold mb-4">منتجاتك ({products.length})</h2>

                {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        لا توجد منتجات بعد
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                            >
                                {product.image_url && (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full aspect-square object-cover"
                                    />
                                )}
                                <div className="p-3">
                                    <h3 className="font-medium text-gray-900 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-[#008069] font-bold">
                                        {product.price} جنيه
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
