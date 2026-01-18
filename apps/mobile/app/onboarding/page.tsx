'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
// import { createStore } from '@/app/actions/store'; // REMOVED: Server Action
import { api } from '@/lib/api/client'; // ADDED: API Client
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, ArrowLeft, Upload, Check, Store as StoreIcon, Phone, Share2, Globe, Truck, Pencil, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@whatsou/shared';
import { slugify } from '@/lib/utils/slug';
import { Capacitor } from '@capacitor/core';
import { createBrowserClient } from '@supabase/ssr';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingStore, setCheckingStore] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t, language, setLanguage, direction } = useLanguage();

    // Step 1: Basic Info
    const [storeName, setStoreName] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [isEditingSlug, setIsEditingSlug] = useState(false);
    const [description, setDescription] = useState('');
    const [allowDelivery, setAllowDelivery] = useState(true);
    const [allowPickup, setAllowPickup] = useState(false);
    const [defaultLanguage, setDefaultLanguage] = useState('en');

    // Step 2: Branding & Socials
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [email, setEmail] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [locationUrl, setLocationUrl] = useState('');

    useEffect(() => {
        const checkExistingStore = async () => {
            if (authLoading) return;

            if (!user) {
                router.push('/login');
                return;
            }

            // We can use Supabase client directly here as it uses public key
            // Or use API if preferred. Supabase client is fine for reading public/RLS data
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
    }, [user, router, authLoading]);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const handleDefaultLanguageChange = (lang: string) => {
        setDefaultLanguage(lang);
        // Auto-switch interface language to match
        if (lang === 'ar' || lang === 'en') {
            setLanguage(lang as 'en' | 'ar');
        }
    };

    const generateSlug = (name: string) => {
        return slugify(name);
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

    const handleNativeLogoCamera = async () => {
        try {
            const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false, // Disabled to prevent "Edit with" dialog
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos, // Use Photos to avoid "Open With" dialog
            });

            if (image.dataUrl) {
                setLogoPreview(image.dataUrl);
                // Convert Base64 DataURL to File
                const res = await fetch(image.dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'logo.jpg', { type: blob.type });
                setLogoFile(file);
            }
        } catch (error) {
            console.error('Camera error', error);
        }
    };

    const handleGetLocation = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                toast({
                    title: t('onboarding.locating'),
                    description: t('onboarding.getting_location'),
                });

                const { Geolocation } = await import('@capacitor/geolocation');
                const permission = await Geolocation.checkPermissions();
                if (permission.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        throw new Error('Permission denied');
                    }
                }

                const position = await Geolocation.getCurrentPosition();
                const { latitude, longitude } = position.coords;
                const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
                setLocationUrl(link);
                toast({
                    title: t('onboarding.location_found'),
                    description: t('onboarding.location_set'),
                });
            } catch (error: any) {
                console.error('Geolocation error:', error);
                toast({
                    title: t('common.error'),
                    description: error.message || t('onboarding.location_error'),
                    variant: 'destructive',
                });
            }
            return;
        }

        if (!navigator.geolocation) {
            toast({
                title: t('common.error'),
                description: t('onboarding.geolocation_not_supported'),
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: t('onboarding.locating'),
            description: t('onboarding.getting_location'),
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
                setLocationUrl(link);
                toast({
                    title: t('onboarding.location_found'),
                    description: t('onboarding.location_set'),
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = t('onboarding.location_error');
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = t('onboarding.location_permission_denied');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = t('onboarding.location_unavailable');
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = t('onboarding.location_timeout');
                }

                toast({
                    title: t('common.error'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile) return null;

        try {
            const formData = new FormData();
            formData.append('file', logoFile);
            formData.append('folder', 'logos');

            // Use absolute URL for upload on mobile if needed, but api client might handle it
            // Standard fetch to backend API
            const backendUrl = Capacitor.isNativePlatform() ? 'https://whatsou.com' : '';
            // If we use api client it handles base URL

            // Ideally we use api.fetch for file upload too, but it expects JSON usually?
            // Our api client in apps/web/lib/api/client.ts uses fetch and handles headers.
            // But for FormData we shouldn't set Content-Type: application/json.
            // Let's us raw fetch with correct URL base

            const response = await fetch(`${backendUrl}/api/upload`, {
                method: 'POST',
                body: formData,
                // Do NOT set Content-Type header, browser sets it with boundary
                headers: {
                    // Add authorization if needed? /api/upload usually requires it or RLS
                    // If we have token in localStorage:
                    ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {})
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data.url;
        } catch (error: any) {
            console.error('Logo upload error:', error);
            toast({
                title: t('onboarding.logo_upload_warning'),
                description: t('onboarding.logo_upload_failed'),
                variant: 'destructive',
            });
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Validate unique slug first
            const slug = customSlug || generateSlug(storeName);
            const { data: existingStore } = await supabase
                .from('stores')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (existingStore) {
                toast({
                    title: t('onboarding.store_name_taken'),
                    description: t('onboarding.store_name_taken_desc'),
                    variant: 'destructive',
                });
                setLoading(false);
                setStep(1);
                return;
            }

            const logoUrl = await uploadLogo();

            // Preparing JSON payload instead of FormData
            const payload = {
                name: storeName,
                slug,
                description,
                whatsapp_number: standardizePhoneNumber(user.phone),
                default_language: defaultLanguage,
                email,
                logo_url: logoUrl,
                facebook_url: facebookUrl,
                instagram_url: instagramUrl,
                twitter_url: twitterUrl,
                tiktok_url: tiktokUrl,
                location_url: locationUrl,
                allow_delivery: allowDelivery,
                allow_pickup: allowPickup
            };

            // USE API CLIENT INSTEAD OF SERVER ACTION
            const result = await api.post<any>('/api/dashboard/store', payload);

            if (result.error) throw new Error(result.error);

            toast({
                title: t('onboarding.store_created'),
                description: t('onboarding.welcome_message'),
            });

            router.push('/dashboard/subscription');
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.message,
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (!storeName.trim()) {
            toast({
                title: t('onboarding.required_field'),
                description: t('onboarding.enter_store_name'),
                variant: 'destructive',
            });
            return;
        }
        if (!allowDelivery && !allowPickup) {
            toast({
                title: t('onboarding.required_field'),
                description: t('settings.delivery_required_error'),
                variant: 'destructive',
            });
            return;
        }
        setStep(2);
    };

    if (checkingStore) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4" dir={direction}>

            {/* Language Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white/80 transition-all z-10"
                onClick={toggleLanguage}
                title="Switch Language"
            >
                <Globe className="w-5 h-5 text-green-700" />
            </Button>

            <Card className="w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-green-600 p-2">
                    <div className={`flex justify-center gap-2 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                        <div className={`h-2 w-1/2 rounded-full transition-all ${step >= 1 ? 'bg-white' : 'bg-green-800/30'}`} />
                        <div className={`h-2 w-1/2 rounded-full transition-all ${step >= 2 ? 'bg-white' : 'bg-green-800/30'}`} />
                    </div>
                </div>
                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto bg-green-100 w-16 h-16 rounded-3xl flex items-center justify-center mb-2">
                        {step === 1 ? <Image src="/logo.png" alt="WhatSou Logo" width={48} height={48} className="w-10 h-10 object-contain" /> : <Share2 className="w-8 h-8 text-green-600" />}
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        {step === 1 ? t('onboarding.step1_title') : t('onboarding.step2_title')}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {step === 1 ? t('onboarding.step1_desc') : t('onboarding.step2_desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    {step === 1 ? (
                        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in-0 duration-300">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>{t('onboarding.store_name')} <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder={t('onboarding.store_name')}
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="rounded-xl h-12"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-xs text-muted-foreground" dir="ltr">
                                            {t('onboarding.store_url').replace('{slug}', '')}
                                        </p>

                                        {isEditingSlug ? (
                                            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                                <Input
                                                    value={customSlug}
                                                    onChange={(e) => setCustomSlug(slugify(e.target.value))}
                                                    className="h-7 text-xs px-2 rounded-md"
                                                    autoFocus
                                                    placeholder="my-store"
                                                />
                                                <button
                                                    onClick={() => setIsEditingSlug(false)}
                                                    className="p-1 hover:bg-gray-100 rounded-full text-green-600"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 group">
                                                <span className="font-medium text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded dir-ltr">
                                                    {customSlug || generateSlug(storeName) || 'store-name'}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        if (!customSlug) setCustomSlug(generateSlug(storeName));
                                                        setIsEditingSlug(true);
                                                    }}
                                                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-full text-gray-500"
                                                    title="Edit URL"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('onboarding.default_language')}</Label>
                                    <div className="flex gap-4 p-3 border rounded-xl bg-gray-50/50">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="language"
                                                value="en"
                                                checked={defaultLanguage === 'en'}
                                                onChange={(e) => handleDefaultLanguageChange(e.target.value)}
                                                className="w-4 h-4 text-green-600 focus:ring-green-600"
                                            />
                                            <span>{t('onboarding.english')}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="language"
                                                value="ar"
                                                checked={defaultLanguage === 'ar'}
                                                onChange={(e) => handleDefaultLanguageChange(e.target.value)}
                                                className="w-4 h-4 text-green-600 focus:ring-green-600"
                                            />
                                            <span>{t('onboarding.arabic')}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('onboarding.description')} <span className="text-xs text-gray-400">{t('onboarding.description_optional')}</span></Label>
                                <Textarea
                                    placeholder={t('onboarding.description_placeholder')}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-xl resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Delivery Options */}
                            <div className="space-y-2">
                                <Label>{t('settings.delivery_options')} <span className="text-red-500">*</span></Label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${allowDelivery ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={allowDelivery}
                                            onChange={(e) => setAllowDelivery(e.target.checked)}
                                            className="w-5 h-5 text-green-600 focus:ring-green-600 rounded"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-green-600" />
                                            <span className="font-medium">{t('settings.allow_delivery')}</span>
                                        </div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${allowPickup ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={allowPickup}
                                            onChange={(e) => setAllowPickup(e.target.checked)}
                                            className="w-5 h-5 text-green-600 focus:ring-green-600 rounded"
                                        />
                                        <div className="flex items-center gap-2">
                                            <StoreIcon className="w-5 h-5 text-green-600" />
                                            <span className="font-medium">{t('settings.allow_pickup')}</span>
                                        </div>
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">{t('onboarding.delivery_options_hint')}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('onboarding.whatsapp_number')}</Label>
                                <div className="relative">
                                    <Input
                                        value={user?.phone || ''}
                                        disabled
                                        className={`rounded-xl h-12 bg-gray-50 ${direction === 'rtl' ? 'pr-10' : 'pl-10'}`}
                                    />
                                    <Phone className={`w-4 h-4 absolute top-4 text-gray-400 ${direction === 'rtl' ? 'right-3' : 'left-3'}`} />
                                    <div className={`absolute top-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 ${direction === 'rtl' ? 'left-3' : 'right-3'}`}>
                                        <Check className="w-3 h-3" /> {t('onboarding.verified')}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('onboarding.linked_account')}
                                </p>
                            </div>

                            <Button
                                onClick={nextStep}
                                className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-base font-semibold mt-4"
                            >
                                {t('onboarding.next_step')}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in-0 duration-300">

                            {/* Logo Upload */}
                            <label
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100 transition-all cursor-pointer group"
                                onClick={(e) => {
                                    if (Capacitor.isNativePlatform()) {
                                        e.preventDefault();
                                        handleNativeLogoCamera();
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className={Capacitor.isNativePlatform() ? "hidden" : "hidden"}
                                />
                                <div className="relative w-24 h-24 mb-4">
                                    {logoPreview ? (
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            fill
                                            className="object-cover rounded-full border-4 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-green-100 shadow-sm group-hover:border-green-200 transition-colors">
                                            <Upload className="w-8 h-8 text-green-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                    <div className={`absolute bottom-0 p-1.5 bg-green-600 rounded-full text-white shadow-lg group-hover:bg-green-700 transition-colors ${direction === 'rtl' ? 'left-0' : 'right-0'}`}>
                                        <Upload className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 group-hover:text-green-700 transition-colors">{t('onboarding.upload_logo')}</p>
                                <p className="text-xs text-gray-400 mt-1">{t('onboarding.logo_recommended')}</p>
                            </label>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('onboarding.support_email')}</Label>
                                    <Input
                                        type="email"
                                        placeholder={t('onboarding.support_email_placeholder')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500 uppercase font-semibold">{t('onboarding.facebook')}</Label>
                                        <Input
                                            placeholder="facebook.com/..."
                                            value={facebookUrl}
                                            onChange={(e) => setFacebookUrl(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500 uppercase font-semibold">{t('onboarding.instagram')}</Label>
                                        <Input
                                            placeholder="instagram.com/..."
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500 uppercase font-semibold">{t('onboarding.twitter')}</Label>
                                        <Input
                                            placeholder="twitter.com/..."
                                            value={twitterUrl}
                                            onChange={(e) => setTwitterUrl(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500 uppercase font-semibold">{t('onboarding.tiktok')}</Label>
                                        <Input
                                            placeholder="tiktok.com/@..."
                                            value={tiktokUrl}
                                            onChange={(e) => setTiktokUrl(e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs text-gray-500 uppercase font-semibold">{t('onboarding.location')}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://maps.google.com/..."
                                                value={locationUrl}
                                                onChange={(e) => setLocationUrl(e.target.value)}
                                                className="rounded-xl"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleGetLocation}
                                                className="rounded-xl shrink-0"
                                                title={t('onboarding.get_current_location')}
                                            >
                                                <StoreIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="h-12 w-12 rounded-xl border-gray-200 p-0 shrink-0"
                                >
                                    <ArrowLeft className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-base font-semibold"
                                >
                                    {loading ? t('onboarding.creating_store') : t('onboarding.launch_store')}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
