# WhatSou - WhatsApp Commerce Platform

**Photo → Price → Sell**

A complete multi-tenant SaaS platform that enables merchants to create WhatsApp-linked stores in under 60 seconds.

## Features

### For Merchants
- **Lightning Fast Setup**: Create your store in 60 seconds with just a name and WhatsApp number
- **Simple Product Management**: Add products with images, prices, descriptions, and up to 3 customizable options
- **WhatsApp Integration**: Orders are sent directly to your WhatsApp for seamless communication
- **Beautiful Dashboard**: Clean, WhatsApp-inspired interface for managing your catalog
- **Instant Store Link**: Get a shareable URL (e.g., whatsou.com/your-store) to send to customers

### For Customers
- **Apple-Style Shopping**: Minimalist, mobile-first storefront with high-quality design
- **Product Options**: Select from customizable options (size, color, etc.) before purchasing
- **Simple Checkout**: Quick 3-field form (name, phone, address) for fast orders
- **WhatsApp Orders**: Complete purchase with automatic WhatsApp message generation

## Technology Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage (Product Images)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Supabase account ([supabase.com](https://supabase.com))

### Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Create a new Supabase project
   - Go to Settings > API to get your credentials
   - Create a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Set Up Database**
   - The database schema is already created via migrations
   - Tables: `stores`, `products`, `orders`
   - RLS policies are configured for multi-tenant security

4. **Configure Storage**
   - In Supabase Dashboard, go to Storage
   - Create a new bucket named `products`
   - Make it public for image access

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   - Visit `http://localhost:3000`
   - Sign up for a new account
   - Complete the onboarding to create your store

## Project Structure

```
app/
├── [slug]/              # Public storefront pages
│   ├── page.tsx         # Store homepage with product grid
│   └── p/[id]/          # Individual product pages
├── dashboard/           # Merchant dashboard
├── login/              # Authentication pages
├── signup/
└── onboarding/         # Store setup wizard

components/
├── dashboard/          # Dashboard components
│   ├── ProductCard.tsx
│   └── ProductFormModal.tsx
├── storefront/         # Customer-facing components
│   ├── StorefrontClient.tsx
│   ├── ProductGrid.tsx
│   ├── ProductDetailClient.tsx
│   └── CartDrawer.tsx
└── ui/                 # shadcn/ui components

lib/
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── supabase/          # Supabase clients
└── types/             # TypeScript types
```

## Database Schema

### stores
- Multi-tenant store information
- Unique slugs for custom URLs
- WhatsApp number for order integration

### products
- Product catalog with images
- Price comparison (current vs original)
- JSONB options field for variants (max 3)
- Stock quantity tracking

### orders
- Customer order history
- JSONB snapshot of cart items
- Includes selected options and prices

## Key Features Explained

### Product Options
- Merchants can add up to 3 options per product (e.g., Size, Color, Material)
- Each option has a name and multiple values
- Stored as JSONB for flexibility
- Customers must select all options before adding to cart

### WhatsApp Integration
- Orders generate formatted WhatsApp messages
- Includes customer details, items, options, and total
- Opens WhatsApp directly with pre-filled message
- No payment processing - handled via WhatsApp conversation

### Multi-Tenancy
- Each merchant gets their own store with unique slug
- Row Level Security (RLS) ensures data isolation
- Public access to storefronts via slug
- Protected dashboard access for store owners

## Design Philosophy

### Merchant Experience
- **WhatsApp Web Aesthetic**: Familiar green (#008069) header and clean interface
- **Stupidly Simple**: No analytics, complex charts, or overwhelming features
- **Fast Product Entry**: Upload image, set price, done

### Customer Experience
- **Apple/Zara Style**: Minimalist, high-quality product presentation
- **Mobile-First**: Optimized for smartphone shopping
- **Friction-Free**: 3-field checkout, no account required

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables
4. Deploy

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Merchants can only access their own data
- Public read access for storefronts
- Anonymous users can create orders
- JWT-based authentication via Supabase

## Future Enhancements

Potential additions (not included in v1):
- Order management dashboard for merchants
- Analytics and insights
- Multiple product images
- Inventory alerts
- Customer profiles
- Payment gateway integration
- Discount codes
- Shipping calculations

## License

MIT License - feel free to use for your own projects!

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for WhatsApp commerce**
