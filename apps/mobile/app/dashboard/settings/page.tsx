'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { Store } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Store as StoreIcon, Phone, Share2, Upload, Truck, QrCode, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import { useLanguage } from '@whatsou/shared';
import { api } from '@/lib/api/client';
import { Capacitor } from '@capacitor/core';
import type { CameraResultType, CameraSource } from '@capacitor/camera';
import { Switch } from "@/components/ui/switch";
import { StoreShippingSettings } from '@/components/dashboard/StoreShippingSettings';
import { ShippingConfig } from '@/types/shipping';

import { useStore } from '@/lib/contexts/StoreContext';

export default function SettingsPage() {
    const { store, loading: storeLoading, refetchStore } = useStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [defaultLanguage, setDefaultLanguage] = useState('en');
    const [email, setEmail] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [allowDelivery, setAllowDelivery] = useState(true);
    const [allowPickup, setAllowPickup] = useState(false);

    // Shipping Configuration
    const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({ type: 'none' });
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

    // Password Change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    // Delete Account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);


    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t, direction } = useLanguage();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user) {
            // Biometric check
            if (Capacitor.isNativePlatform()) {
                import('capacitor-native-biometric').then(({ NativeBiometric }) => {
                    NativeBiometric.isAvailable().then((result) => {
                        setBiometricAvailable(result.isAvailable);
                        import('@capacitor/preferences').then(({ Preferences }) => {
                            Preferences.get({ key: 'biometric_enabled' }).then(({ value }) => {
                                setBiometricEnabled(value === 'true');
                            });
                        });
                    }).catch(() => { });
                });
            }
        }
    }, [user, router, authLoading]);

    // Effect to populate form when store data is available from context
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
            setShippingConfig((store.shipping_config as unknown as ShippingConfig) || { type: 'none' });
            setFreeShippingThreshold(store.free_shipping_threshold ?? null);

            setLoading(false);
        } else if (!storeLoading) {
            // If store loading finished but no store, loading should be false (layout handles redirect)
            setLoading(false);
        }
    }, [store, storeLoading]);

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

    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile) return logoUrl;

        try {
            const formData = new FormData();
            formData.append('file', logoFile);
            formData.append('folder', 'logos');

            const result = await api.fetch<{ url: string }>('/api/upload', {
                method: 'POST',
                body: formData,
            });

            return result.url;
        } catch (error: any) {
            toast({
                title: 'Logo upload failed',
                description: error.message,
                variant: 'destructive',
            });
            return logoUrl;
        }
    };

    const handleRegenerateQR = async () => {
        if (!store) return;

        if (Capacitor.isNativePlatform()) {
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
            await Haptics.impact({ style: ImpactStyle.Heavy });
        }

        setSaving(true);
        try {
            const result = await api.post<{ success: boolean; qr_code?: string; error?: string }>('/api/store/qr');
            if (result.error) throw new Error(result.error);

            await refetchStore();

            toast({
                title: direction === 'rtl' ? 'تم تحديث رمز QR' : 'QR Code Regenerated',
                description: direction === 'rtl' ? 'تم تحديث رمز الاستجابة السريعة بنجاح' : 'Your store QR code has been regenerated successfully.',
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

        if (Capacitor.isNativePlatform()) {
            const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
            await Haptics.impact({ style: ImpactStyle.Medium });
        }

        setSaving(true);


        try {
            const uploadedLogoUrl = await uploadLogo();

            const storeData = {
                name,
                description: description || null,
                whatsapp_number: standardizePhoneNumber(whatsappNumber),
                default_language: defaultLanguage,
                email: email || null,
                logo_url: uploadedLogoUrl,
                facebook_url: facebookUrl || null,
                instagram_url: instagramUrl || null,
                twitter_url: twitterUrl || null,
                tiktok_url: tiktokUrl || null,
                location_url: locationUrl || null,
                allow_delivery: allowDelivery,
                allow_pickup: allowPickup,
                shipping_config: shippingConfig,
                free_shipping_threshold: freeShippingThreshold,
            };

            const result = await api.put<{ success: boolean; error?: string }>('/api/dashboard/store', storeData);

            if (result.error) {
                throw new Error(result.error);
            }

            await refetchStore();

            toast({
                title: t('settings.saved'),
                description: t('settings.saved_desc'),
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

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: t('common.error'),
                description: direction === 'rtl' ? 'يرجى ملء جميع حقول كلمة المرور' : 'Please fill all password fields',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: t('common.error'),
                description: direction === 'rtl' ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: t('common.error'),
                description: direction === 'rtl' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters',
                variant: 'destructive',
            });
            return;
        }

        setChangingPassword(true);
        try {
            const result = await api.post<{ success: boolean; error?: string }>('/api/auth/change-password', {
                currentPassword,
                newPassword,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            toast({
                title: t('settings.saved'),
                description: direction === 'rtl' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully',
            });

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.message === 'Incorrect current password'
                    ? (direction === 'rtl' ? 'كلمة المرور الحالية غير صحيحة' : 'Incorrect current password')
                    : error.message,
                variant: 'destructive',
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteReason.trim()) {
            toast({
                title: t('common.error'),
                description: t('settings.delete_reason_required'),
                variant: 'destructive',
            });
            return;
        }

        setDeleting(true);
        try {
            const result = await api.post<{ success: boolean; error?: string }>('/api/auth/delete-account', { reason: deleteReason });
            if (result.error) throw new Error(result.error);

            // Redirect to login after successful deletion
            router.push('/login');
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
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
                            onClick={() => router.push('/dashboard')}
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
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                    <label
                                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        onClick={(e) => {
                                            if (Capacitor.isNativePlatform()) {
                                                e.preventDefault();
                                                handleNativeLogoCamera();
                                            }
                                        }}
                                    >
                                        <Upload className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className={Capacitor.isNativePlatform() ? "hidden" : "hidden"} // Always hidden, driven by label click for non-native default behavior
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

                    {/* Shipping Settings */}
                    <StoreShippingSettings
                        shippingConfig={shippingConfig}
                        freeShippingThreshold={freeShippingThreshold}
                        onConfigChange={setShippingConfig}
                        onThresholdChange={setFreeShippingThreshold}
                    />

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
                                        onClick={async () => {
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

                    {/* Security / Password Change */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-[#008069]" />
                            {direction === 'rtl' ? 'الأمان' : 'Security'}
                        </h3>
                        <div className="space-y-4 max-w-md">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{direction === 'rtl' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{direction === 'rtl' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-gray-700">{direction === 'rtl' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="h-11 rounded-lg bg-gray-50 border-none focus:ring-2 focus:ring-[#008069]"
                                />
                            </div>
                            <Button
                                onClick={handlePasswordChange}
                                disabled={changingPassword}
                                className="bg-[#008069] hover:bg-green-500 text-white font-bold rounded-lg mt-2 w-full"
                            >
                                {changingPassword ? (direction === 'rtl' ? 'جاري التغيير...' : 'Changing...') : (direction === 'rtl' ? 'تغيير كلمة المرور' : 'Change Password')}
                            </Button>
                        </div>
                    </div>

                    {/* Biometric Settings */}
                    {biometricAvailable && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-[#008069]" />
                                        {direction === 'rtl' ? 'تسجيل الدخول بالبصمة' : 'Biometric Login'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {direction === 'rtl'
                                            ? 'استخدم بصمة الإصبع أو الوجه لتسجيل الدخول'
                                            : 'Use fingerprint or face ID to log in'}
                                    </p>
                                </div>
                                <Switch
                                    checked={biometricEnabled}
                                    onCheckedChange={async (checked) => {
                                        setBiometricEnabled(checked);
                                        const { Preferences } = await import('@capacitor/preferences');
                                        await Preferences.set({
                                            key: 'biometric_enabled',
                                            value: String(checked),
                                        });
                                        if (checked) {
                                            try {
                                                const { NativeBiometric } = await import('capacitor-native-biometric');
                                                const result = await NativeBiometric.verifyIdentity({
                                                    reason: 'Enable biometric login',
                                                    title: 'Authenticate',
                                                    subtitle: 'Verify your identity',
                                                    description: 'Use face ID or fingerprint',
                                                });
                                            } catch (e) {
                                                setBiometricEnabled(false);
                                                await Preferences.set({ key: 'biometric_enabled', value: 'false' });
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}


                    {/* Danger Zone */}
                    <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
                        <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {t('settings.danger_zone')}
                        </h3>
                        <p className="text-sm text-red-600 mb-6 font-medium">
                            {t('settings.danger_zone_desc')}
                        </p>

                        <div className="space-y-4">
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('settings.delete_account')}
                            </Button>
                        </div>
                    </div>

                    {/* Delete Account Modal (Simple Overlay) */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                                <h3 className="text-xl font-bold text-red-600 mb-2">{t('settings.delete_account_title')}</h3>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    {t('settings.delete_warning')}
                                </p>

                                <Label className="mb-2 block font-semibold">{t('settings.delete_reason_label')}</Label>
                                <Textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder={t('settings.delete_reason_placeholder')}
                                    className="mb-4 bg-gray-50"
                                />

                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                        {t('common.cancel')}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleting || !deleteReason.trim()}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {deleting ? 'Deleting...' : t('settings.confirm_delete')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
