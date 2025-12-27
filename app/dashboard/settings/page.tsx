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
import { ArrowLeft, Save, Store as StoreIcon, Phone, Share2, Upload, Truck, QrCode, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { regenerateStoreQR } from '@/app/actions/store';
import { updateStore } from '@/app/actions/dashboard';
import { changePassword } from '@/app/actions/auth';

export default function SettingsPage() {
    const [store, setStore] = useState<Store | null>(null);
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

    // Password Change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t, direction } = useLanguage();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user) {
            loadStore();
        }
    }, [user, router, authLoading]);

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
                setDefaultLanguage(data.default_language || 'en');
                setEmail(data.email || '');
                setLogoUrl(data.logo_url || '');
                setLogoPreview(data.logo_url || '');
                setFacebookUrl(data.facebook_url || '');
                setInstagramUrl(data.instagram_url || '');
                setTwitterUrl(data.twitter_url || '');
                setTiktokUrl(data.tiktok_url || '');
                setLocationUrl(data.location_url || '');
                setAllowDelivery(data.allow_delivery ?? true);
                setAllowPickup(data.allow_pickup ?? false);
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
            const formData = new FormData();
            formData.append('file', logoFile);
            formData.append('folder', 'logos');

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data.url;
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
        setSaving(true);
        try {
            const result = await regenerateStoreQR(store.id);
            if (result.error) throw new Error(result.error);

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
            };

            const result = await updateStore(store.id, storeData);

            if (result.error) {
                throw new Error(result.error);
            }

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
            const formData = new FormData();
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);

            const result = await changePassword(formData);

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
