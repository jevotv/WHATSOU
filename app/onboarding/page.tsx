'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, ArrowLeft, Upload, Check, Store as StoreIcon, Phone, Share2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/contexts/LanguageContext';

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
  const [description, setDescription] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('en');

  // Step 2: Branding & Socials
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [email, setEmail] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  useEffect(() => {
    const checkExistingStore = async () => {
      if (authLoading) return;

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
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
    if (!logoFile) return null;

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
      const slug = generateSlug(storeName);
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
        // Go back to step 1 if slug is taken (though validation should ideally happen before step 2)
        setStep(1);
        return;
      }

      const logoUrl = await uploadLogo();

      const { error } = await supabase.from('stores').insert({
        user_id: user.id,
        name: storeName,
        slug,
        description: description || null,
        whatsapp_number: standardizePhoneNumber(user.phone), // Use auth user phone
        default_language: defaultLanguage,
        email: email || null,
        logo_url: logoUrl,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        twitter_url: twitterUrl || null,
        tiktok_url: tiktokUrl || null,
      });

      if (error) throw error;

      toast({
        title: t('onboarding.store_created'),
        description: t('onboarding.welcome_message'),
      });

      router.push('/dashboard');
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
            {step === 1 ? <StoreIcon className="w-8 h-8 text-green-600" /> : <Share2 className="w-8 h-8 text-green-600" />}
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
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {t('onboarding.store_url').replace('{slug}', generateSlug(storeName) || 'store-name')}
                  </p>
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
              {/* Logo Upload */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-100 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
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
