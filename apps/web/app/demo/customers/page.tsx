'use client';

import { useState, useEffect } from 'react';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
import { Loader2, Phone, ShoppingBag, MessageCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';

type Customer = {
    name: string;
    phone: string;
    totalOrders: number;
    lastOrderDate: string;
};

export default function MockCustomersPage() {
    const { orders, loading } = useMockDashboard();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { t, direction } = useLanguage();

    useEffect(() => {
        if (loading) return;

        // Aggregate unique customers by phone number from orders
        const customerMap = new Map<string, Customer>();

        orders?.forEach((order) => {
            const phone = standardizePhoneNumber(order.customer_phone);
            if (!customerMap.has(phone)) {
                customerMap.set(phone, {
                    name: order.customer_name,
                    phone: order.customer_phone,
                    totalOrders: 0,
                    lastOrderDate: order.created_at,
                });
            }

            const customer = customerMap.get(phone)!;
            customer.totalOrders += 1;
        });

        setCustomers(Array.from(customerMap.values()));
    }, [orders, loading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold">{t('dashboard.nav_customers') || 'Customers'} (Demo)</h1>
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
