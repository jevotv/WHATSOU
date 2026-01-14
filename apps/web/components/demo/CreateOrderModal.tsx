'use client';

import { useState } from 'react';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@whatsou/shared';

interface CreateOrderModalProps {
    onClose: () => void;
}

export default function CreateOrderModal({ onClose }: CreateOrderModalProps) {
    const { products, createOrder } = useMockDashboard();
    const { t } = useLanguage();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [notes, setNotes] = useState('');

    const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number; variantId?: string }[]>([]);

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...selectedItems];
        (newItems[index] as any)[field] = value;
        setSelectedItems(newItems);
    };

    const calculateTotal = () => {
        return selectedItems.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return sum;

            let price = product.current_price;
            // Simple variant check if needed, but for now just use base price or first variant
            // Real implementation would be more complex matching variant ID
            return sum + (price * item.quantity);
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) return;

        const orderItems = selectedItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                product_id: item.productId,
                product_name: product?.name || 'Unknown Product',
                quantity: item.quantity,
                price: product?.current_price || 0,
                selected_options: {} // Empty for mock simplicity unless we build full variant selector
            };
        });

        createOrder({
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
            delivery_type: deliveryType,
            notes,
            total_price: calculateTotal(),
            order_items: orderItems,
        });

        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6" /> Local Cart (Simulate Order)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer Name</Label>
                            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="John Doe" required className="rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+123456789" required className="rounded-2xl" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Address</Label>
                            <Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="123 Street, City" required={deliveryType === 'delivery'} className="rounded-2xl" />
                        </div>
                        <div className="space-y-2">
                            <Label>Delivery Type</Label>
                            <Select value={deliveryType} onValueChange={(v: any) => setDeliveryType(v)}>
                                <SelectTrigger className="rounded-2xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="delivery">Home Delivery</SelectItem>
                                    <SelectItem value="pickup">Pickup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Notes</Label>
                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="rounded-2xl resize-none" />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Items</h3>
                            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="rounded-2xl">
                                <Plus className="w-4 h-4 mr-1" /> Add Item
                            </Button>
                        </div>

                        {selectedItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-2xl">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Product</Label>
                                    <Select value={item.productId} onValueChange={(v) => handleItemChange(index, 'productId', v)}>
                                        <SelectTrigger className="bg-white rounded-xl h-9">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} - ${p.current_price}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-20 space-y-1">
                                    <Label className="text-xs">Qty</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        className="bg-white rounded-xl h-9"
                                    />
                                </div>
                                <Button type="button" onClick={() => handleRemoveItem(index)} variant="ghost" size="icon" className="h-9 w-9 mb-[2px] text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-2 font-bold text-lg">
                            <span>Total:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" onClick={onClose} variant="outline" className="flex-1 rounded-3xl h-12">Cancel</Button>
                        <Button type="submit" className="flex-1 rounded-3xl h-12 bg-[#008069] hover:bg-[#017561]" disabled={selectedItems.length === 0}>
                            Place Mock Order
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
