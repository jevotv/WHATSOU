'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/lib/types/database';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedOptions: { [key: string]: string }) => void;
  updateQuantity: (
    productId: string,
    selectedOptions: { [key: string]: string },
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('whatsou_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('whatsou_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product_id === newItem.product_id &&
          JSON.stringify(item.selected_options) === JSON.stringify(newItem.selected_options)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...prevItems, newItem];
    });
  };

  const removeItem = (productId: string, selectedOptions: { [key: string]: string }) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product_id === productId &&
            JSON.stringify(item.selected_options) === JSON.stringify(selectedOptions)
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    selectedOptions: { [key: string]: string },
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, selectedOptions);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId &&
        JSON.stringify(item.selected_options) === JSON.stringify(selectedOptions)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
