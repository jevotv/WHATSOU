'use client';

import { useState } from 'react';
import { Store } from '@/lib/types/database';
import { useCart } from '@/lib/contexts/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  store: Store;
}

export default function CartDrawer({ open, onClose, store }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Re-enable order recording when ready
      // const { error } = await supabase.from('orders').insert({
      //   store_id: store.id,
      //   customer_name: customerName,
      //   customer_phone: customerPhone,
      //   customer_address: customerAddress,
      //   order_items: items,
      //   total_price: totalPrice,
      // });
      // if (error) throw error;

      let message = `🛍️ *New Order from WhatSou!*\n\n`;
      message += `*Customer:* ${customerName}\n`;
      message += `*Phone:* ${customerPhone}\n`;
      message += `*Address:* ${customerAddress}\n\n`;
      message += `*Items:*\n`;

      items.forEach((item) => {
        message += `\n• ${item.product_name} x ${item.quantity}`;
        const optionText = Object.entries(item.selected_options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (optionText) {
          message += `\n  (${optionText})`;
        }
        message += `\n  $${(item.price * item.quantity).toFixed(2)}`;
      });

      message += `\n\n*Total: $${totalPrice.toFixed(2)}*`;

      const whatsappUrl = `https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(message)}`;

      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setShowCheckout(false);

      toast({
        title: 'Order placed!',
        description: 'Redirecting to WhatsApp...',
      });

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        onClose();
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            {showCheckout ? 'Checkout' : 'Your Cart'}
          </SheetTitle>
        </SheetHeader>

        {!showCheckout ? (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="relative w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {item.product_name}
                      </h4>
                      {Object.keys(item.selected_options).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.selected_options)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-bold text-green-600 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.selected_options,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() =>
                            updateQuantity(
                              item.product_id,
                              item.selected_options,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg ml-auto"
                          onClick={() => removeItem(item.product_id, item.selected_options)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-14 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1234567890"
                  type="tel"
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Address *</Label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <h4 className="font-semibold">Order Summary</h4>
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-14 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </Button>
              <Button
                onClick={() => setShowCheckout(false)}
                variant="outline"
                className="w-full h-14 rounded-3xl text-lg font-semibold"
              >
                Back to Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
