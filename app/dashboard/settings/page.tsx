'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Store } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Store as StoreIcon, Phone, Share2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SettingsPage() {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');

    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadStore();
    }, [user, router]);

    const loadStore = async () => {
        if (!user) return;

        try {
            const { data } = await supabase
                .from('stores')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (data) {
                setStore(data);
                setName(data.name);
                setDescription(data.description || '');
                setWhatsappNumber(data.whatsapp_number);
                setEmail(data.email || '');
                setLogoUrl(data.logo_url || '');
                setLogoPreview(data.logo_url || '');
                setFacebookUrl(data.facebook_url || '');
                setInstagramUrl(data.instagram_url || '');
                setTwitterUrl(data.twitter_url || '');
                setTiktokUrl(data.tiktok_url || '');
            }
        } catch (error) {
            console.error('Error loading store:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile) return logoUrl;

        try {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${store?.id || 'new'}-logo.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, logoFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            toast({
                title: 'Logo upload failed',
                description: error.message,
                variant: 'destructive',
            });
            return logoUrl;
        }
    };

    const handleSave = async () => {
        if (!store) return;
        setSaving(true);

        try {
            const uploadedLogoUrl = await uploadLogo();

            const { error } = await supabase
                .from('stores')
                .update({
                    name,
                    description: description || null,
                    whatsapp_number: whatsappNumber,
                    email: email || null,
                    logo_url: uploadedLogoUrl,
                    facebook_url: facebookUrl || null,
                    instagram_url: instagramUrl || null,
                    twitter_url: twitterUrl || null,
                    tiktok_url: tiktokUrl || null,
                })
                .eq('id', store.id);

            if (error) throw error;

            toast({
                title: 'Settings saved!',
                description: 'Your store settings have been updated',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1fdb64]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f8f7]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#1fdb64] hover:bg-green-500 text-[#111813] font-bold rounded-lg"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Store Identity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-[#1fdb64]" />
                            Store Identity
                        </h3>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Logo */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer">
                                    <div className="relative h-32 w-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gradient-to-br from-[#1fdb64] to-green-600">
                                        {logoPreview ? (
                                            <Image
                                                src={logoPreview}
                                                alt="Store logo"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-white text-4xl font-bold">
                                                    {name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <span className="text-sm font-medium text-[#1fdb64]">Change Logo</span>
                            </div>

                            {/* Name & Description */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-gray-700">Store Name</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Awesome Store"
                                        className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-gray-700">Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell customers about your store..."
                                        rows={4}
                                        className="rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64] resize-none"
                                    />
                                    <p className="text-xs text-gray-500 text-right">{description.length}/500 characters</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#1fdb64]" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">WhatsApp Number</Label>
                                <Input
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                                <p className="text-xs text-gray-500">This number receives order notifications.</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Support Email</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="support@yourstore.com"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-[#1fdb64]" />
                            Social Media
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Facebook</Label>
                                <Input
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    placeholder="https://facebook.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Instagram</Label>
                                <Input
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    placeholder="https://instagram.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Twitter / X</Label>
                                <Input
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    placeholder="https://twitter.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">TikTok</Label>
                                <Input
                                    value={tiktokUrl}
                                    onChange={(e) => setTiktokUrl(e.target.value)}
                                    placeholder="https://tiktok.com/@yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#1fdb64]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
