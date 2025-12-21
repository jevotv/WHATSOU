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
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import { useLanguage } from '@/lib/contexts/LanguageContext';

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
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleCheckout = async () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: t('cart.missing_info'),
        description: t('cart.missing_info_desc'),
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

      // Update product/variant quantities
      for (const item of items) {
        if (item.variant_id) {
          // Update variant quantity
          const { error: variantError } = await supabase.rpc('decrement_variant_quantity', {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          });
          if (variantError) {
            console.error('Error updating variant quantity:', variantError);
          }
        } else {
          // Update product quantity
          const { error: productError } = await supabase.rpc('decrement_product_quantity', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
          if (productError) {
            console.error('Error updating product quantity:', productError);
          }
        }
      }

      // Emojis and Arabic Text (using strict unicode escapes)
      // 🎉 = \uD83C\uDF89
      // 👤 = \uD83D\uDC64
      // 📱 = \uD83D\uDCF1
      // 🏠 = \uD83C\uDFE0
      // 📝 = \uD83D\uDCDD
      // 🛒 = \uD83D\uDED2
      // 🏷️ = \uD83C\uDFF7\uFE0F
      // 🔢 = \uD83D\uDD22
      // 💵 = \uD83D\uDCB5
      // 🚚 = \uD83D\uDE9A
      // ⚡ = \u26A1

      // "أهلاً يا" -> \u0623\u0647\u0644\u0627\u064b \u064a\u0627
      // "جالك طلب جديد من" -> \u062c\u0627\u0644\u0643 \u0637\u0644\u0628 \u062c\u062f\u064a\u062f \u0645\u0646
      // "بياناتي الشخصية" (User requested change) -> \u0628\u064a\u0627\u0646\u0627\u062a\u064a \u0627\u0644\u0634\u062e\u0635\u064a\u0629
      // "الاسم" -> \u0627\u0644\u0627\u0633\u0645
      // "الموبايل" -> \u0627\u0644\u0645\u0648\u0628\u0627\u064a\u0644
      // "العنوان" -> \u0627\u0644\u0639\u0646\u0648\u0627\u0646
      // "ملاحظات" -> \u0645\u0644\u0627\u062d\u0638\u0627\u062a
      // "تفاصيل الأوردر" -> \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0623\u0648\u0631\u062f\u0631
      // "العدد" -> \u0627\u0644\u0639\u062f\u062f
      // "قطع" -> \u0642\u0637\u0639
      // "السعر" -> \u0627\u0644\u0633\u0639\u0631
      // "ج.م" -> \u062c.\u0645
      // "المبلغ الإجمالي" -> \u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a
      // "أرجو تأكيد الطلب وبدء التجهيز." (User requested change) -> \u0623\u0631\u062c\u0648 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u0648\u0628\u062f\u0621 \u0627\u0644\u062a\u062c\u0647\u064a\u0632.

      let message = `${t('whatsapp.greeting', { storeName: store.name })}\n\n`;
      message += `${t('whatsapp.personal_details')}\n`;
      message += `${t('whatsapp.name', { name: customerName })}\n`;
      message += `${t('whatsapp.phone', { phone: standardizePhoneNumber(customerPhone) })}\n`;
      message += `${t('whatsapp.address', { address: customerAddress })}\n`;

      if (notes.trim()) {
        message += `${t('whatsapp.notes', { notes })}\n`;
      }

      message += `\n${t('whatsapp.order_details')}\n`;
      message += `${t('whatsapp.separator')}\n`;

      items.forEach((item) => {
        message += `${t('whatsapp.product_prefix')}${item.product_name}\n`;
        // Handle options if any
        const optionText = Object.entries(item.selected_options)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (optionText) {
          message += `   (${optionText})\n`;
        }

        message += `${t('whatsapp.quantity', { quantity: item.quantity })}\n`;
        message += `${t('whatsapp.price', { price: (item.price * item.quantity).toFixed(2) })}\n`;
        message += `${t('whatsapp.separator')}\n`;
      });

      message += `\n${t('whatsapp.total', { total: totalPrice.toFixed(2) })}\n\n`;
      message += `${t('whatsapp.footer')}`;

      const whatsappUrl = `https://wa.me/${store.whatsapp_number}?text=${encodeURIComponent(message)}`;

      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setNotes('');
      setShowCheckout(false);

      toast({
        title: t('cart.order_placed'),
        description: t('cart.order_placed_desc'),
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
            {showCheckout ? t('cart.checkout_title') : t('cart.title')}
          </SheetTitle>
        </SheetHeader>

        {!showCheckout ? (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{t('cart.empty')}</p>
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
                        {t('common.currency')} {(item.price * item.quantity).toFixed(2)}
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
                  <span>{t('cart.total')}</span>
                  <span>{t('common.currency')} {totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-14 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
                >
                  {t('cart.proceed')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <div className="space-y-2">
                <Label>{t('cart.form.name')}</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('cart.form.name_placeholder')}
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('cart.form.phone')}</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t('cart.form.phone_placeholder')}
                  type="tel"
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('cart.form.address')}</Label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={t('cart.form.address_placeholder')}
                  className="rounded-2xl h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('cart.form.notes')}</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('cart.form.notes_placeholder')}
                  className="rounded-2xl h-12"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl space-y-2">
                <h4 className="font-semibold">{t('cart.form.summary')}</h4>
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span>{t('common.currency')} {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{t('cart.total')}</span>
                  <span>{t('common.currency')} {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-14 rounded-3xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
              >
                {loading ? t('cart.processing') : t('cart.confirm_order')}
              </Button>
              <Button
                onClick={() => setShowCheckout(false)}
                variant="outline"
                className="w-full h-14 rounded-3xl text-lg font-semibold"
              >
                {t('cart.back_to_cart')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
