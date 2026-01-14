'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Phone, ShoppingBag, MessageCircle, Search, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import Link from 'next/link';
import { api } from '@/lib/api/client';

type Customer = {
    name: string;
    phone: string;
    totalOrders: number;
    lastOrderDate: string;
};

interface CustomersResponse {
    customers: Array<{
        customer_name: string;
        customer_phone: string;
        created_at: string;
    }>;
    error?: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { t, direction, language } = useLanguage();
    const { subscription, loading: subLoading } = useSubscription();
    const isReadOnly = subscription?.isReadOnly ?? false;

    const { user } = useAuth();

    const fetchCustomers = useCallback(async () => {
        if (!user) return;

        try {
            const result = await api.get<CustomersResponse>('/api/dashboard/customers');

            if (result.error) {
                console.error('Error fetching customers:', result.error);
                return;
            }

            const orders = result.customers;

            // Aggregate unique customers by phone number
            const customerMap = new Map<string, Customer>();

            orders?.forEach((order) => {
                const phone = standardizePhoneNumber(order.customer_phone);
                // Use phone as key
                if (!customerMap.has(phone)) {
                    customerMap.set(phone, {
                        name: order.customer_name,
                        phone: order.customer_phone, // Keep original display format or use standardized?
                        totalOrders: 0,
                        lastOrderDate: order.created_at,
                    });
                }

                const customer = customerMap.get(phone)!;
                customer.totalOrders += 1;
            });

            setCustomers(Array.from(customerMap.values()));
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    if (loading || subLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (isReadOnly) {
        return (
            <div className="max-w-md mx-auto px-4 py-16 text-center">
                <div className="bg-red-100 border-2 border-red-500 rounded-2xl p-8">
                    <Lock className="w-16 h-16 mx-auto text-red-600 mb-4" />
                    <h2 className="text-xl font-bold text-red-700 mb-2">
                        {language === 'ar' ? 'وضع القراءة فقط' : 'Read-Only Mode'}
                    </h2>
                    <p className="text-red-600 mb-6">
                        {language === 'ar'
                            ? 'اشتراكك منتهي. جدد للوصول لبيانات العملاء.'
                            : 'Your subscription has expired. Renew to access customer data.'}
                    </p>
                    <Link
                        href="/dashboard/subscription"
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700"
                    >
                        {language === 'ar' ? 'جدد الآن' : 'Renew Now'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold">{t('dashboard.nav_customers') || 'Customers'}</h1>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {customers.length}
                </span>
            </div>

            <div className="mb-6 relative">
                <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                    placeholder={t('dashboard.search_customers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'} rounded-xl bg-white`}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customers
                    .filter((customer) => {
                        const query = searchQuery.toLowerCase();
                        return (
                            customer.name.toLowerCase().includes(query) ||
                            customer.phone.includes(query)
                        );
                    })
                    .map((customer, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{customer.name}</h3>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                            <ShoppingBag className="w-3 h-3" /> {customer.totalOrders} {t('customers.orders')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={`https://wa.me/${standardizePhoneNumber(customer.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors shadow-sm"
                                title="Contact on WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </a>
                        </div>
                    ))}

                {customers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {t('customers.no_customers')}
                    </div>
                )}
            </div>
        </div>
    );
}
