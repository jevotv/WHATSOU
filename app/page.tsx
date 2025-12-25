import Link from 'next/link';
import { Cairo } from 'next/font/google';
import Image from 'next/image';

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
                  <span>ابدأ متجرك المجاني الآن</span>
                  <span className="material-icons-outlined text-sm rtl:rotate-180">arrow_forward</span>
                </Link>
                <a href="#demo" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-lg px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                  <span>شاهد الفيديو</span>
                  <span className="material-icons-outlined text-landing-primary">play_circle</span>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
                <a href="#" className="bg-green-50 hover:bg-green-100 text-landing-primary border border-landing-primary/20 dark:bg-green-900/10 dark:text-green-300 dark:hover:bg-green-900/20 text-base px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                  <span>جرب لوحة التحكم</span>
                  <span className="material-icons-outlined text-sm">dashboard</span>
                </a>
                <a href="#" className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 text-base px-6 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2">
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
              <div className="relative rounded-[2.5rem] border-8 border-gray-900 dark:border-gray-700 bg-gray-900 shadow-2xl overflow-hidden z-10">
                <div className="bg-white dark:bg-gray-800 h-[600px] w-full overflow-hidden flex flex-col">
                  <div className="bg-landing-primary p-4 flex justify-between items-center text-white">
                    <span className="font-bold">متجر الأناقة</span>
                    <span className="material-icons-outlined">shopping_cart</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-2 pb-4">
                        <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded-lg mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="h-4 w-1/2 bg-landing-primary/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-full bg-landing-primary h-12 rounded-xl flex items-center justify-center text-white font-bold">
                      إتمام الطلب عبر واتساب
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[110%] bg-gradient-to-tr from-green-100 to-white dark:from-green-900/20 dark:to-gray-800 rounded-full blur-2xl opacity-70"></div>
            </div>
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">شارك الرابط</h3>
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
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-landing-background-light dark:bg-landing-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">جدول الأسعار</h2>
            <p className="text-gray-600 dark:text-gray-400">ابدأ مجاناً، وادفع فقط عندما تنمو</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-landing-surface-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الباقة المجانية</h3>
              <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">0 <span className="text-lg font-normal text-gray-500">ج.م / للأبد</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="material-icons-outlined text-green-500">check</span>
                  <span>حتى 20 منتج</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="material-icons-outlined text-green-500">check</span>
                  <span>طلبات عبر الواتساب فقط</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <span className="material-icons-outlined text-green-500">check</span>
                  <span>مظهر WhatSou الأساسي</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-full font-bold transition-colors">
                ابدأ مجاناً
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-landing-surface-dark rounded-3xl p-8 border-2 border-landing-primary shadow-xl relative transform md:-translate-y-4 flex flex-col">
              <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-landing-primary text-white px-4 py-1 rounded-full text-sm font-bold">الأكثر طلباً</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الباقة الاحترافية</h3>
              <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">300 <span className="text-lg font-normal text-gray-500">ج.م / شهر</span></div>
              <ul className="space-y-4 mb-8 flex-1">
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
              </ul>
              <Link href="/signup" className="block w-full text-center bg-landing-primary hover:bg-landing-primary-hover text-white py-3 rounded-full font-bold shadow-lg shadow-landing-primary/30 transition-colors">
                اشترك الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            انضم لـ <span className="text-landing-primary">+100 تاجر</span> بدأوا ينظموا مبيعاتهم مع WhatSou.
          </h2>
          <div className="flex justify-center">
            <a href="#" className="group bg-white dark:bg-transparent border-2 border-landing-primary text-landing-primary hover:bg-landing-primary hover:text-white px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2">
              <span>شوف شكل متجرك هيكون عامل ازاي (Demo)</span>
              <span className="material-icons-outlined transform group-hover:-translate-x-1 transition-transform rtl:rotate-180">arrow_right_alt</span>
            </a>
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
                حالياً نوفر نطاقات فرعية (subdomains) مجانية مثل storename.whatsou.com، ونعمل على إتاحة ربط النطاقات الخاصة في التحديثات القادمة للباقة الاحترافية.
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
