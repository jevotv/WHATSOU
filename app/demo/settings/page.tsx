'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Store as StoreIcon, Phone, Share2, Upload, Truck, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
import QRCode from 'qrcode';

export default function MockSettingsPage() {
    const { store, updateStore } = useMockDashboard();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [defaultLanguage, setDefaultLanguage] = useState('en');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [allowDelivery, setAllowDelivery] = useState(true);
    const [allowPickup, setAllowPickup] = useState(false);

    const router = useRouter();
    const { toast } = useToast();
    const { t, direction } = useLanguage();

    useEffect(() => {
        if (store) {
            setName(store.name);
            setDescription(store.description || '');
            setWhatsappNumber(store.whatsapp_number);
            setDefaultLanguage(store.default_language || 'en');
            setEmail(store.email || '');
            setLogoUrl(store.logo_url || '');
            setLogoPreview(store.logo_url || '');
            setFacebookUrl(store.facebook_url || '');
            setInstagramUrl(store.instagram_url || '');
            setTwitterUrl(store.twitter_url || '');
            setTiktokUrl(store.tiktok_url || '');
            setLocationUrl(store.location_url || '');
            setAllowDelivery(store.allow_delivery ?? true);
            setAllowPickup(store.allow_pickup ?? false);
            setLoading(false);
        }
    }, [store]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                setLogoUrl(reader.result as string); // In mock, we use the base64 string directly
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegenerateQR = async () => {
        if (!store) return;
        setSaving(true);
        try {
            // Mock regeneration
            const url = `${window.location.origin}/go/${store.id}`;
            const qrDataUrl = await QRCode.toDataURL(url);
            updateStore({ qr_code: qrDataUrl });

            toast({
                title: direction === 'rtl' ? 'تم تحديث رمز QR (تجريبي)' : 'QR Code Regenerated (Demo)',
                description: direction === 'rtl' ? 'تم تحديث رمز الاستجابة السريعة محليًا' : 'Your store QR code has been regenerated locally.',
            });
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!store) return;
        setSaving(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            updateStore({
                name,
                description: description || undefined,
                whatsapp_number: standardizePhoneNumber(whatsappNumber),
                default_language: defaultLanguage,
                email: email || undefined,
                logo_url: logoUrl,
                facebook_url: facebookUrl || undefined,
                instagram_url: instagramUrl || undefined,
                twitter_url: twitterUrl || undefined,
                tiktok_url: tiktokUrl || undefined,
                location_url: locationUrl || undefined,
                allow_delivery: allowDelivery,
                allow_pickup: allowPickup,
            });

            toast({
                title: t('settings.saved') + " (Demo)",
                description: t('settings.saved_desc') + " Changes are local to this session.",
            });
        } catch (error: any) {
            toast({
                title: t('common.error'),
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f8f7]" dir={direction}>
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.push('/demo')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                            <span className="font-medium">{t('common.back')}</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#008069] hover:bg-green-500 text-[#111813] font-bold rounded-lg"
                        >
                            <Save className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            {saving ? t('common.saving') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-24">
                <div className="space-y-6">
                    {/* Store Identity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-[#008069]" />
                            {t('settings.identity')}
                        </h3>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Logo */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer">
                                    <div className="relative h-32 w-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gradient-to-br from-[#008069] to-green-600">
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
                                <span className="text-sm font-medium text-[#008069]">{t('settings.change_logo')}</span>
                            </div>

                            {/* Name & Description */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-gray-700">{t('settings.store_name')}</Label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Awesome Store"
                                        className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-gray-700">{t('settings.description')}</Label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t('settings.description')}
                                        rows={4}
                                        className="rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069] resize-none"
                                    />
                                    <p className="text-xs text-gray-500 text-right">{t('settings.character_limit', { current: description.length, max: 500 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-[#008069]" />
                            {t('settings.contact_info')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{t('settings.whatsapp')}</Label>
                                <Input
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                                <p className="text-xs text-gray-500">{t('settings.whatsapp_desc')}</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{t('settings.email')}</Label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="support@yourstore.com"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5 mt-6">
                                <Label className="text-sm font-bold text-gray-700">{t('settings.default_language')}</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            value="en"
                                            checked={defaultLanguage === 'en'}
                                            onChange={(e) => setDefaultLanguage(e.target.value)}
                                            className="w-4 h-4 text-[#008069] focus:ring-[#008069]"
                                        />
                                        <span>{t('settings.english')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            value="ar"
                                            checked={defaultLanguage === 'ar'}
                                            onChange={(e) => setDefaultLanguage(e.target.value)}
                                            className="w-4 h-4 text-[#008069] focus:ring-[#008069]"
                                        />
                                        <span>{t('settings.arabic')}</span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">{t('settings.language_help')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#008069]" />
                            {t('settings.delivery_options')}
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={allowDelivery}
                                    onChange={(e) => {
                                        if (!e.target.checked && !allowPickup) {
                                            toast({
                                                title: t('settings.delivery_required_error'),
                                                variant: 'destructive',
                                            });
                                            return;
                                        }
                                        setAllowDelivery(e.target.checked);
                                    }}
                                    className="w-5 h-5 text-[#008069] focus:ring-[#008069] rounded"
                                />
                                <div>
                                    <span className="font-medium">{t('settings.allow_delivery')}</span>
                                    <p className="text-xs text-gray-500 mt-0.5">{t('settings.allow_delivery_desc')}</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={allowPickup}
                                    onChange={(e) => {
                                        if (!e.target.checked && !allowDelivery) {
                                            toast({
                                                title: t('settings.delivery_required_error'),
                                                variant: 'destructive',
                                            });
                                            return;
                                        }
                                        setAllowPickup(e.target.checked);
                                    }}
                                    className="w-5 h-5 text-[#008069] focus:ring-[#008069] rounded"
                                />
                                <div>
                                    <span className="font-medium">{t('settings.allow_pickup')}</span>
                                    <p className="text-xs text-gray-500 mt-0.5">{t('settings.allow_pickup_desc')}</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-[#008069]" />
                            {t('settings.social_media')}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Facebook</Label>
                                <Input
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    placeholder="https://facebook.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Instagram</Label>
                                <Input
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    placeholder="https://instagram.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">Twitter / X</Label>
                                <Input
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    placeholder="https://twitter.com/yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">TikTok</Label>
                                <Input
                                    value={tiktokUrl}
                                    onChange={(e) => setTiktokUrl(e.target.value)}
                                    placeholder="https://tiktok.com/@yourstore"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{t('onboarding.location')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={locationUrl}
                                        onChange={(e) => setLocationUrl(e.target.value)}
                                        placeholder="https://maps.google.com/..."
                                        className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
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
                                        }}
                                        className="h-11 rounded-lg border-gray-200 text-gray-600 hover:text-[#008069] shrink-0"
                                        title={t('onboarding.get_current_location')}
                                    >
                                        <StoreIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings / QR Code */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-[#008069]" />
                            {direction === 'rtl' ? 'رمز الاستجابة السريعة (QR)' : 'QR Code'}
                        </h3>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {direction === 'rtl'
                                    ? 'إذا كنت تواجه مشاكل في مسح رمز QR الخاص بمتجرك، يمكنك إعادة إنشائه هنا.'
                                    : 'If you are experiencing issues with scanning your store QR code, you can regenerate it here.'}
                            </p>
                            <Button
                                onClick={handleRegenerateQR}
                                disabled={saving}
                                variant="outline"
                                className="border-[#008069] text-[#008069] hover:bg-green-50"
                            >
                                {direction === 'rtl' ? 'إعادة إنشاء رمز QR' : 'Regenerate QR Code'}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
