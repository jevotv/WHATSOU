export interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  whatsapp_number: string;
  email?: string;
  logo_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  default_language?: string;
  qr_code?: string;
  allow_delivery?: boolean;
  allow_pickup?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductOption {
  name: string;
  values: string[];  // Simple string values
}

export interface ProductVariant {
  id: string;
  product_id: string;
  option_values: { [key: string]: string };  // e.g., {"Size": "XL", "Color": "Red"}
  price: number;
  quantity: number;
  sku?: string;
  unlimited_stock?: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description?: string;
  current_price: number;  // Base price / "Starting from" price
  original_price?: number;
  image_url?: string;      // Full size (1200x1200)
  thumbnail_url?: string;  // Thumbnail (200x200)
  category?: string;
  quantity: number;  // Used for simple products without variants
  unlimited_stock?: boolean;
  options: ProductOption[];
  variants?: ProductVariant[];  // Loaded when needed
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  variant_id?: string;  // For products with variants
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
  customer_address?: string;
  delivery_type: 'delivery' | 'pickup';
  order_items: OrderItem[];
  total_price: number;
  created_at: string;
  notes?: string;
}

export interface CartItem extends OrderItem {
  image_url?: string;
}
