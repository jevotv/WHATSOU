'use client';

import { useState } from 'react';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
import { Loader2, Package, Calendar, Phone, MapPin, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, isToday, isYesterday, subDays, isAfter, startOfDay, parseISO } from 'date-fns';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import CreateOrderModal from '@/components/demo/CreateOrderModal';

export default function MockOrdersPage() {
    const { orders, loading } = useMockDashboard();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState('all');
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const { t, direction } = useLanguage();

    const toggleExpand = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{t('dashboard.nav_orders') || 'Orders'} (Demo)</h1>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                        {orders.length}
                    </span>
                </div>
                <Button
                    onClick={() => setShowCreateOrder(true)}
                    className="bg-[#008069] hover:bg-[#017561] rounded-2xl"
                >
                    + New Mock Order
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                    <Input
                        placeholder={t('dashboard.search_orders')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`${direction === 'rtl' ? 'pr-10' : 'pl-10'} rounded-xl bg-white`}
                    />
                </div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl bg-white">
                        <Filter className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dashboard.filter_all')}</SelectItem>
                        <SelectItem value="today">{t('dashboard.filter_today')}</SelectItem>
                        <SelectItem value="yesterday">{t('dashboard.filter_yesterday')}</SelectItem>
                        <SelectItem value="last_7_days">{t('dashboard.filter_last_7_days')}</SelectItem>
                        <SelectItem value="last_30_days">{t('dashboard.filter_last_30_days')}</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] rounded-xl bg-white">
                        <SelectValue placeholder={t('dashboard.filter_delivery_type')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dashboard.filter_all_types')}</SelectItem>
                        <SelectItem value="delivery">{t('dashboard.filter_delivery')}</SelectItem>
                        <SelectItem value="pickup">{t('dashboard.filter_pickup')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {orders
                .filter((order) => {
                    // Search Filter
                    const query = searchQuery.toLowerCase();
                    const matchesSearch =
                        order.customer_name.toLowerCase().includes(query) ||
                        order.customer_phone.includes(query);

                    if (!matchesSearch) return false;

                    // Date Filter
                    const orderDate = parseISO(order.created_at);
                    if (dateFilter === 'today') {
                        return isToday(orderDate);
                    } else if (dateFilter === 'yesterday') {
                        return isYesterday(orderDate);
                    } else if (dateFilter === 'last_7_days') {
                        return isAfter(orderDate, subDays(startOfDay(new Date()), 7));
                    } else if (dateFilter === 'last_30_days') {
                        return isAfter(orderDate, subDays(startOfDay(new Date()), 30));
                    }

                    return true;
                })
                .filter((order) => {
                    // Delivery Type Filter
                    if (deliveryFilter === 'all') return true;
                    return order.delivery_type === deliveryFilter;
                })
                .length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">{t('dashboard.no_orders') || 'No orders found'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders
                        .filter((order) => {
                            const query = searchQuery.toLowerCase();
                            const matchesSearch =
                                order.customer_name.toLowerCase().includes(query) ||
                                order.customer_phone.includes(query);

                            if (!matchesSearch) return false;

                            const orderDate = parseISO(order.created_at);
                            if (dateFilter === 'today') {
                                return isToday(orderDate);
                            } else if (dateFilter === 'yesterday') {
                                return isYesterday(orderDate);
                            } else if (dateFilter === 'last_7_days') {
                                return isAfter(orderDate, subDays(startOfDay(new Date()), 7));
                            } else if (dateFilter === 'last_30_days') {
                                return isAfter(orderDate, subDays(startOfDay(new Date()), 30));
                            }

                            return true;
                        })
                        .filter((order) => {
                            if (deliveryFilter === 'all') return true;
                            return order.delivery_type === deliveryFilter;
                        })
                        .map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div
                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {order.delivery_type === 'pickup' ? (
                                                <span title={t('dashboard.filter_pickup')} className="text-lg">🏪</span>
                                            ) : (
                                                <span title={t('dashboard.filter_delivery')} className="text-lg">🏠</span>
                                            )}
                                            <span className="font-bold text-lg">{order.customer_name}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {order.customer_phone}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                                        <span className="font-bold text-lg">{t('common.currency')} {Number(order.total_price).toFixed(2)}</span>
                                        {expandedOrderId === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                    </div>
                                </div>

                                {expandedOrderId === order.id && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                                        <div className="text-sm">
                                            <h4 className="font-medium mb-2 text-gray-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" /> {t('customers.delivery_address')}
                                            </h4>
                                            <p className="text-gray-600 pl-6">{order.customer_address}</p>
                                        </div>

                                        {order.notes && (
                                            <div className="text-sm">
                                                <h4 className="font-medium mb-2 text-gray-700 flex items-center gap-2">
                                                    📝 {t('common.notes') || 'Notes'}
                                                </h4>
                                                <p className="text-gray-600 pl-6">{order.notes}</p>
                                            </div>
                                        )}

                                        <div className="text-sm">
                                            <h4 className="font-medium mb-2 text-gray-700 flex items-center gap-2">
                                                <Package className="w-4 h-4" /> {t('customers.order_items')}
                                            </h4>
                                            <div className="pl-6 space-y-2">
                                                {Array.isArray(order.order_items) && order.order_items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                                                        <span>
                                                            <span className="font-semibold text-black">{item.quantity}x</span> {item.product_name}
                                                        </span>
                                                        <span>{t('common.currency')} {(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}

            {showCreateOrder && <CreateOrderModal onClose={() => setShowCreateOrder(false)} />}
        </div>
    );
}
