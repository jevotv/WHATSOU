import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Zap, Share2, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">WhatSou</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-2xl">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-3xl bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
            Your WhatsApp Store
            <br />
            <span className="text-green-600">in 60 Seconds</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
            Photo → Price → Sell
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="rounded-3xl h-14 px-8 text-lg bg-green-600 hover:bg-green-700">
                <Zap className="w-5 h-5 mr-2" />
                Create Your Store Now
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-32">
          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Lightning Fast Setup
            </h3>
            <p className="text-gray-600">
              Create your store in under 60 seconds. No technical skills needed.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              WhatsApp Integration
            </h3>
            <p className="text-gray-600">
              Orders go directly to your WhatsApp. Manage everything in one place.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Share2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Easy to Share
            </h3>
            <p className="text-gray-600">
              Get a beautiful storefront link to share with your customers instantly.
            </p>
          </div>
        </div>

        <div className="text-center mt-32">
          <p className="text-gray-500 mb-6">Join thousands of sellers already using WhatSou</p>
          <Link href="/signup">
            <Button className="rounded-3xl h-14 px-8 text-lg bg-green-600 hover:bg-green-700">
              Start Selling Today
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 WhatSou. Built for WhatsApp commerce.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
