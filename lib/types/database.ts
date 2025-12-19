export interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  current_price: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  quantity: number;
  options: ProductOption[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  selected_options: { [key: string]: string };
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_items: OrderItem[];
  total_price: number;
  created_at: string;
}

export interface CartItem extends OrderItem {
  image_url?: string;
}
