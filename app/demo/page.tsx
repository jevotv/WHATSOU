'use client';

import { Plus, Package, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
import { Product } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/dashboard/ProductCard';
import MockProductFormModal from '@/components/demo/MockProductFormModal';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function MockDashboardPage() {
    const { store, products, loading, deleteProduct } = useMockDashboard();
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOutOfStock, setShowOutOfStock] = useState(false);
    const { toast } = useToast();
    const { t, direction } = useLanguage();

    const handleProductSaved = () => {
        setShowProductForm(false);
        setEditingProduct(null);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDeleteProduct = (productId: string) => {
        if (!confirm(t('products.delete_confirm'))) return;
        deleteProduct(productId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
            </div>
        );
    }

    return (
        <>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.products')} (Demo)</h2>
                            <p className="text-gray-600">
                                {products.length} Products
                            </p>
                        </div>
                        <div className="flex flex-1 gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-72">
                                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                                <Input
                                    type="text"
                                    placeholder={t('dashboard.search_products')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'} h-10 rounded-2xl border-gray-200`}
                                />
                            </div>
                            <Button
                                variant={showOutOfStock ? "default" : "outline"}
                                onClick={() => setShowOutOfStock(!showOutOfStock)}
                                className={`h-10 rounded-2xl gap-2 px-3 sm:px-4 ${showOutOfStock ? 'bg-[#008069] hover:bg-[#017561]' : ''}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="whitespace-nowrap">{t('dashboard.filter_out_of_stock')}</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {t('dashboard.no_products')}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {t('dashboard.start_selling')}
                        </p>
                        <Button
                            onClick={() => setShowProductForm(true)}
                            className="rounded-3xl bg-[#008069] hover:bg-[#017561] h-12 px-8"
                        >
                            <Plus className={`w-5 h-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            {t('dashboard.add_first_product')}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products
                            .filter((product) => {
                                let matchesSearch = true;
                                if (searchQuery.trim()) {
                                    const query = searchQuery.toLowerCase();
                                    matchesSearch = (
                                        product.name.toLowerCase().includes(query) ||
                                        (product.description?.toLowerCase().includes(query) ?? false) ||
                                        (product.category?.toLowerCase().includes(query) ?? false)
                                    );
                                }

                                let matchesStock = true;
                                if (showOutOfStock) {
                                    const hasVariants = product.variants && product.variants.length > 0;
                                    const totalStock = hasVariants
                                        ? product.variants!.reduce((sum: number, v: any) => sum + v.quantity, 0)
                                        : product.quantity;
                                    const isUnlimited = product.unlimited_stock;

                                    if (isUnlimited || totalStock > 0) matchesStock = false;
                                }

                                return matchesSearch && matchesStock;
                            })
                            .map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={handleEditProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                    </div>
                )}
            </main>

            {showProductForm && store && (
                <MockProductFormModal
                    storeId={store.id}
                    storeSlug={store.slug}
                    product={editingProduct}
                    onClose={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                    }}
                    onSaved={handleProductSaved}
                />
            )}

            {products.length > 0 && !showProductForm && (
                <button
                    onClick={() => setShowProductForm(true)}
                    className={`fixed bottom-28 ${direction === 'rtl' ? 'left-8' : 'right-8'} z-[60] bg-[#008069] text-white rounded-full p-5 shadow-2xl hover:bg-[#017561] transition-all hover:scale-110`}
                    aria-label={t('dashboard.add_product')}
                >
                    <Plus className="w-8 h-8" />
                </button>
            )}
        </>
    );
}
