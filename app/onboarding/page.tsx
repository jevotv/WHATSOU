'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStore, setCheckingStore] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkExistingStore = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        router.push('/dashboard');
      } else {
        setCheckingStore(false);
      }
    };

    checkExistingStore();
  }, [user, router]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const slug = generateSlug(storeName);

      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existingStore) {
        toast({
          title: 'Store name taken',
          description: 'Please choose a different store name',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('stores').insert({
        user_id: user.id,
        name: storeName,
        slug,
        whatsapp_number: whatsappNumber,
      });

      if (error) throw error;

      toast({
        title: 'Store created!',
        description: 'Welcome to WhatSou',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (checkingStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-green-500 w-16 h-16 rounded-3xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Set Up Your Store</CardTitle>
          <CardDescription className="text-base">
            Just 2 fields and you're ready to sell
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Store Name</label>
              <Input
                type="text"
                placeholder="My Awesome Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="rounded-2xl h-12"
              />
              <p className="text-xs text-gray-500">
                Your store URL: whatsou.com/{generateSlug(storeName) || 'your-store'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">WhatsApp Number</label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="rounded-2xl h-12"
              />
              <p className="text-xs text-gray-500">
                Include country code (e.g., +1 for USA)
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-3xl bg-green-600 hover:bg-green-700 text-base font-semibold"
            >
              {loading ? 'Creating store...' : 'Create My Store'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
