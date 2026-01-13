'use client';

import Link from 'next/link';
import { Cairo } from 'next/font/google';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const cairo = Cairo({ subsets: ['arabic'], weight: ['300', '400', '600', '700', '800'] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-landing-background-light dark:bg-landing-background-dark text-gray-800 dark:text-gray-100 transition-colors duration-300 ${cairo.className}`} dir="rtl">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-landing-surface-light/90 dark:bg-landing-surface-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <Image src="/logo.png" alt="WhatSou Logo" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">WhatSou</span>
            </div>
            <div className="hidden md:flex items-center space-x-reverse space-x-8">
              <Link href="/login" className="text-base font-medium text-gray-600 dark:text-gray-300 hover:text-landing-primary transition-colors">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="bg-landing-primary hover:bg-landing-primary-hover text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-landing-primary/30 transition-all transform hover:-translate-y-0.5">
                ابدأ الآن
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 focus:outline-none" type="button">
                <span className="material-icons-outlined text-3xl">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-200 dark:bg-green-900/30 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-200 dark:bg-emerald-900/30 blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                حول دردشات الواتساب <br />
                <span className="text-landing-primary">لمتجر احترافي</span> في دقيقتين.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                نظم طلباتك، ابنِ قاعدة عملائك، وزود مبيعاتك بكتالوج ذكي يرسل الطلبات مباشرة لواتسابك.. بدون تعقيد تقني.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup" className="bg-landing-primary hover:bg-landing-primary-hover text-white text-lg px-8 py-4 rounded-full font-bold shadow-xl shadow-landing-primary/40 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  <span>ابدأ متجرك الآن</span>
                  <span className="material-icons-outlined text-sm rtl:rotate-180">arrow_forward</span>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <span>شاهد الفيديو</span>
                      <span className="material-icons-outlined text-landing-primary">play_circle</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none text-white">
                    <div className="relative pt-[177.78%] w-full h-0">
                      <iframe
                        src="https://www.youtube.com/embed/5-o_X4lOiAU?autoplay=1"
                        title="WhatSou Demo"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
                <Link href="/demo" className="bg-green-50 hover:bg-green-100 text-landing-primary border border-landing-primary/20 dark:bg-green-900/10 dark:text-green-300 dark:hover:bg-green-900/20 text-base px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                  <span>جرب لوحة التحكم</span>
                  <span className="material-icons-outlined text-sm">dashboard</span>
                </Link>
                <a href="https://whatsou.com/john" target="_blank" className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 text-base px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                  <span>جرب متجر الزوار</span>
                  <span className="material-icons-outlined text-sm">storefront</span>
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="material-icons-outlined text-landing-primary text-base">check_circle</span>
                <span>لا يحتاج بطاقة ائتمان</span>
                <span className="mx-2">•</span>
                <span className="material-icons-outlined text-landing-primary text-base">check_circle</span>
                <span>إعداد في 60 ثانية</span>
              </div>
            </div>
            {/* Hero Image / Mockup */}
            <div className="relative mx-auto lg:mr-auto lg:ml-0 w-full max-w-sm lg:max-w-md">
              <div className="relative z-10">
                <Image
                  src="/hero-mockup.png"
                  alt="WhatSou App Mockup"
                  width={400}
                  height={800}
                  priority
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="material-icons-outlined text-yellow-500 text-2xl">star</span>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            انضم لـ <span className="text-landing-primary">+100 تاجر</span> بدأوا ينظموا مبيعاتهم مع WhatSou.
          </h2>
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Social Links */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-gray-500 dark:text-gray-400 font-bold">تابعنا على</span>
              <div className="flex items-center gap-6">
                <a href="https://www.facebook.com/whatsoueg/" target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.instagram.com/whatsoueg/" target="_blank" className="text-gray-400 hover:text-pink-600 transition-colors transform hover:scale-110">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 4.123-.06h.08zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </a>
                <a href="https://www.tiktok.com/@whatsoueg" target="_blank" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors transform hover:scale-110">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v10.1c-.05 2.12-.87 4.22-2.38 5.69-1.5 1.53-3.6 2.43-5.71 2.42-4.27-.07-7.74-3.47-7.8-7.75-.03-3.84 2.78-7.25 6.55-7.91V14.8c-1.39.5-2.27 1.84-2.22 3.3.05 1.6 1.32 2.89 2.92 2.91 1.61.02 2.92-1.28 2.93-2.88V.02z" /></svg>
                </a>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/201000499431" target="_blank" className="group bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-5 rounded-full shadow-xl shadow-green-500/20 transition-all flex items-center gap-3 transform hover:-translate-y-1">
              <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              <span className="text-xl font-bold">ابعت لنا رسالة على الواتساب</span>
            </a>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20 bg-white dark:bg-landing-surface-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">وداعاً للفوضى 👋</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">الفرق بين إدارة عملك عبر الدردشة العشوائية وبين استخدام نظام WhatSou المنظم.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Old Way */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                  <span className="material-icons-outlined">close</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">الطريقة التقليدية</h3>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="material-icons-outlined text-red-500 mt-1">sentiment_dissatisfied</span>
                  <span>زهقت من ضياع الطلبات وسط الشات؟</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                  <span className="material-icons-outlined text-red-500 mt-1">sentiment_dissatisfied</span>
                  <span>العملاء بيسألوا كتير عن الأسعار والكتالوج مش منظم؟</span>
                </li>
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 opacity-80">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg rounded-tr-none text-xs w-3/4">بكام ده لو سمحت؟</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg rounded-tr-none text-xs w-2/3">ممكن صور أكتر؟</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg rounded-tr-none text-xs w-3/4">لسه متاح مقاس لارج؟</div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Way (WhatSou) */}
            <div className="bg-green-50 dark:bg-green-900/10 rounded-3xl p-8 border border-green-100 dark:border-green-900/30 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-landing-primary">
                  <span className="material-icons-outlined">check</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">مع WhatSou</h3>
              </div>
              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-medium">
                  <span className="material-icons-outlined text-landing-primary mt-1">verified</span>
                  <span>استقبل الطلبات منظمة بالكامل (المنتج، السعر، العنوان).</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-medium">
                  <span className="material-icons-outlined text-landing-primary mt-1">verified</span>
                  <span>رابط واحد فيه كل منتجاتك بشكل احترافي.</span>
                </li>
              </ul>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-0 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative z-10">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between">
                  <span className="text-xs font-bold text-gray-500">طلب جديد #1024</span>
                  <span className="text-xs text-landing-primary bg-landing-primary/10 px-2 py-0.5 rounded-full">مكتمل</span>
                </div>
                <div className="p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 w-1/2 bg-gray-800 dark:bg-gray-400 rounded mb-2"></div>
                    <div className="h-2 w-1/3 bg-gray-400 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="text-landing-primary font-bold">300 ج.م</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-landing-background-light dark:bg-landing-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">كيف يعمل؟</h2>
            <p className="text-gray-600 dark:text-gray-400">ثلاث خطوات بسيطة لبدء البيع</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white dark:bg-landing-surface-dark p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-landing-surface-dark text-landing-primary">
                <span className="material-icons-outlined text-4xl">add_photo_alternate</span>
              </div>
              <div className="inline-block bg-landing-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">خطوة 1</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">سجل وارفع منتجاتك</h3>
              <p className="text-gray-600 dark:text-gray-400">ضيف صورك وأسعارك وتفاصيل المنتج في ثوانٍ من هاتفك.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-landing-surface-dark p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-landing-surface-dark text-landing-primary">
                <span className="material-icons-outlined text-4xl">share</span>
              </div>
              <div className="inline-block bg-landing-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">خطوة 2</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">شارك الرابط او ال QR</h3>
              <p className="text-gray-600 dark:text-gray-400">حط لينك متجرك في بايو الإنستجرام أو الفيسبوك أو أرسله لعملائك.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-landing-surface-dark p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-landing-surface-dark text-landing-primary">
                <span className="material-icons-outlined text-4xl">whatsapp</span>
              </div>
              <div className="inline-block bg-landing-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">خطوة 3</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">استقبل الطلبات</h3>
              <p className="text-gray-600 dark:text-gray-400">الأوردر هيجيلك منظم على الواتساب وهيتسجل تلقائياً في لوحة تحكمك.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-20 bg-green-50 dark:bg-green-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-landing-primary font-bold tracking-wider uppercase text-sm">حصرياً للمطاعم والبازارات</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-6">
                بازار - مطعم - كافيه؟ <br />
                <span className="text-landing-primary">واتسو هيسد معاك في الزحمه</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                مش محتاج منيو ورقي ولا ويتر ياخد الطلب. العميل بيصور الـ QR Code، يختار طلبه، ويبعته لك على الواتساب جاهز.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-landing-primary">
                    <span className="material-icons-outlined text-2xl">print</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">اطبع الـ QR وعلقه</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">حطه على الترابيزات أو عند الكاشير.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-landing-primary">
                    <span className="material-icons-outlined text-2xl">speed</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">استقبل طلبات أسرع</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">وفر وقت الموظفين وقلل طوابير الانتظار.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-72 h-72 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                <span className="material-icons-outlined text-9xl text-gray-800 dark:text-white mb-2">qr_code_2</span>
                <span className="text-gray-500 text-sm font-mono">scan me to order</span>
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-landing-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-bounce">
                  New!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-landing-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">المميزات الرئيسية</h2>
            <p className="text-gray-600 dark:text-gray-400">كل ما تحتاجه لتنمية تجارتك</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">bolt</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">طلب بضغطة زر</h3>
                <p className="text-gray-600 dark:text-gray-400">تجربة شراء سريعة جداً للعميل بدون الحاجة لتسجيل حساب أو تنزيل تطبيق.</p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">analytics</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لوحة تحكم ذكية</h3>
                <p className="text-gray-600 dark:text-gray-400">تابع مبيعاتك، مخزونك، وأداء متجرك من مكان واحد سهل الاستخدام.</p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">groups</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">متابعة العملاء</h3>
                <p className="text-gray-600 dark:text-gray-400">احتفظ ببيانات عملائك وأرقامهم لإعادة استهدافهم بعروض جديدة.</p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">local_shipping</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تعدد طرق الاستلام</h3>
                <p className="text-gray-600 dark:text-gray-400">حدد خيارات الشحن أو الاستلام من الفرع ودع العميل يختار الأنسب.</p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">travel_explore</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">جاهز تظهر في نتائج جوجل؟</h3>
                <p className="text-gray-600 dark:text-gray-400">متجرك مبني بأحدث تقنيات الـ SEO عشان عملاءك يلاقوك بسهولة.</p>
              </div>
            </div>
            <div className="flex items-start p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-green-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-landing-primary group-hover:scale-110 transition-transform">
                <span className="material-icons-outlined text-3xl">security</span>
              </div>
              <div className="mr-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">بياناتك في أمان</h3>
                <p className="text-gray-600 dark:text-gray-400">نظام حماية متكامل وتشفير للبيانات لضمان خصوصيتك وخصوصية عملائك.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-landing-background-light dark:bg-landing-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"> الأسعار</h2>
          </div>
          <div className="max-w-md mx-auto">
            {/* Pro Plan */}
            <div className="bg-white dark:bg-landing-surface-dark rounded-3xl p-8 border-2 border-landing-primary shadow-xl relative flex flex-col items-center text-center">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-landing-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">الباقة الكاملة</div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 mt-4">الباقة الاحترافية</h3>

              <div className="flex flex-col items-center mb-6">
                <div className="text-5xl font-extrabold text-gray-900 dark:text-white">300 <span className="text-lg font-normal text-gray-500">ج.م / شهر</span></div>
                <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-4 py-1 rounded-full text-sm font-bold mt-2">
                  أول شهر بـ 100 ج.م فقط 🔥
                </div>
              </div>

              <ul className="space-y-4 mb-8 w-full text-right px-4">
                <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="material-icons-outlined text-landing-primary">check_circle</span>
                  <span>منتجات غير محدودة</span>
                </li>
                <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="material-icons-outlined text-landing-primary">check_circle</span>
                  <span>أرشيف كامل للطلبات والعملاء</span>
                </li>
                <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="material-icons-outlined text-landing-primary">check_circle</span>
                  <span>إزالة شعار WhatSou (Branding)</span>
                </li>
                <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="material-icons-outlined text-landing-primary">check_circle</span>
                  <span>روابط السوشيال ميديا واللوكيشن</span>
                </li>
                <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200 font-medium">
                  <span className="material-icons-outlined text-landing-primary">check_circle</span>
                  <span>دعم فني خاص</span>
                </li>
              </ul>

              <Link href="/signup" className="block w-full text-center bg-landing-primary hover:bg-landing-primary-hover text-white py-4 rounded-full font-bold shadow-lg shadow-landing-primary/30 transition-transform transform hover:-translate-y-1 text-lg">
                ابدأ تجربتك بـ 100 ج.م
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-landing-surface-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">الأسئلة الشائعة</h2>
          </div>
          <div className="space-y-4">
            <details className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>هل يحتاج العميل لتنزيل تطبيق للشراء؟</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                لا، العميل يتصفح متجرك عبر رابط ويب بسيط ويقوم بإرسال الطلب مباشرة عبر الواتساب الخاص به. لا توجد أي تطبيقات إضافية مطلوبة.
              </p>
            </details>
            <details className="group bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>هل يمكنني استخدام النطاق (Domain) الخاص بي؟</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                حالياً نوفر نطاقات فرعية (subdomains) مجانية مثل whatsou.com/storename، ونعمل على إتاحة ربط النطاقات الخاصة في التحديثات القادمة للباقة الاحترافية.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4 mb-6 opacity-80">
            <Image src="/logo.png" alt="WhatSou Logo" width={64} height={64} className="w-16 h-16 object-contain" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">WhatSou</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            WhatSou. Built for WhatsApp Commerce 2024 ©
          </p>
        </div>
      </footer>

    </div>
  );
}
