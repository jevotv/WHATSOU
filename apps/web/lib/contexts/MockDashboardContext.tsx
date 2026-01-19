"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, Product, ProductVariant } from '@/lib/types/database';
import { useToast } from '@/hooks/use-toast';

// Define types for our mock data if slightly different, but re-using database types is best
export type MockOrder = {
    id: string;
    store_id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    total_price: number;
    created_at: string;
    order_items: any[];
    delivery_type: 'delivery' | 'pickup';
    notes?: string;
    status: string;
};

interface MockDashboardContextType {
    store: Store | null;
    products: Product[];
    orders: MockOrder[];
    loading: boolean;
    addProduct: (product: Partial<Product> & { variants?: any[] }) => void;
    updateProduct: (product: Partial<Product> & { variants?: any[] }) => void;
    deleteProduct: (productId: string) => void;
    createOrder: (order: Partial<MockOrder>) => void;
    updateStore: (updates: Partial<Store>) => void;
}

const MockDashboardContext = createContext<MockDashboardContextType | undefined>(undefined);

export function MockDashboardProvider({
    children,
    initialStore,
    initialProducts,
    initialOrders
}: {
    children: React.ReactNode;
    initialStore: Store;
    initialProducts: Product[];
    initialOrders: any[];
}) {
    const [store, setStore] = useState<Store | null>(initialStore);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<MockOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Initialize state with props on mount
    useEffect(() => {
        setProducts(initialProducts);
        // Ensure orders match MockOrder type
        setOrders(initialOrders.map(o => ({
            ...o,
            delivery_type: o.delivery_type || 'delivery',
            status: o.status || 'pending'
        })));
        setLoading(false);
    }, [initialProducts, initialOrders]);

    const addProduct = (productData: Partial<Product> & { variants?: any[] }) => {
        const newProduct: Product = {
            ...productData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            store_id: store!.id,
            // Defaults
            description: productData.description || undefined,
            original_price: productData.original_price || undefined,
            category: productData.category || undefined,
            image_url: productData.image_url || undefined,
            thumbnail_url: productData.thumbnail_url || undefined,
            options: productData.options || [],
            name: productData.name!,
            current_price: productData.current_price!,
            quantity: productData.quantity ?? 0,
            unlimited_stock: productData.unlimited_stock ?? false
        };

        // Handle variants if any (store them attached to product for simple mock handling)
        // In real DB they are separate, but for mock UI we can keep them in the product object 
        // if the UI expects them there. Use 'any' type cast if needed or ensure Product type has variants
        const productWithVariants = {
            ...newProduct,
            variants: productData.variants?.map(v => ({
                ...v,
                id: crypto.randomUUID(),
                product_id: newProduct.id
            })) || []
        };

        setProducts(prev => [productWithVariants, ...prev]);
        toast({ title: "Product added (Demo)", description: "This product exists only in your browser session." });
    };

    const updateProduct = (productData: Partial<Product> & { variants?: any[] }) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productData.id) {
                const updated = { ...p, ...productData };
                // Update variants
                if (productData.variants) {
                    (updated as any).variants = productData.variants.map((v: any) => ({
                        ...v,
                        id: v.id || crypto.randomUUID(),
                        product_id: p.id
                    }));
                }
                return updated;
            }
            return p;
        }));
        toast({ title: "Product updated (Demo)", description: "Changes are local." });
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast({ title: "Product deleted (Demo)", description: "Removed from local session." });
    };

    const createOrder = (orderData: Partial<MockOrder>) => {
        const newOrder: MockOrder = {
            id: crypto.randomUUID(),
            store_id: store!.id,
            created_at: new Date().toISOString(),
            customer_name: orderData.customer_name!,
            customer_phone: orderData.customer_phone!,
            customer_address: orderData.customer_address!,
            total_price: orderData.total_price!,
            order_items: orderData.order_items || [],
            delivery_type: orderData.delivery_type || 'delivery',
            notes: orderData.notes,
            status: 'pending'
        };

        setOrders(prev => [newOrder, ...prev]);
        toast({ title: "Order created (Demo)", description: "Check Orders or Customers page." });
    };

    const updateStore = (updates: Partial<Store>) => {
        setStore(prev => prev ? { ...prev, ...updates } : null);
        toast({ title: "Store updated (Demo)", description: "Settings saved for this session." });
    };

    return (
        <MockDashboardContext.Provider value={{
            store,
            products,
            orders,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            createOrder,
            updateStore
        }}>
            {children}
        </MockDashboardContext.Provider>
    );
}

export function useMockDashboard() {
    const context = useContext(MockDashboardContext);
    if (context === undefined) {
        throw new Error('useMockDashboard must be used within a MockDashboardProvider');
    }
    return context;
}
