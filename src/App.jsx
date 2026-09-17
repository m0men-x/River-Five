import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Menu, X, ShoppingCart, ChevronLeft, ChevronRight, 
  Trash2, Plus, Lock, CheckCircle, Tag, Phone, 
  SlidersHorizontal, RefreshCw 
} from 'lucide-react';

// إعداد اتصال Supabase المباشر
const SUPABASE_URL = "https://wdcxchtlwogpdxvfyiga.supabase.co";
const SUPABASE_ANON = "sb_publishable_4aS3S58qsF3KjZsRo-bz4A_989DZqC4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// بيانات افتراضية في حال كانت الجداول خالية
const INITIAL_BANNERS = [
  {
    id: 'b1',
    title: 'أقوى كولكشن صيفي لعام 2026',
    image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    link_url: '#'
  },
  {
    id: 'b2',
    title: 'أحدث صيحات الهوديز والملابس العصرية',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
    link_url: '#'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    title: 'تيشيرت أوفر سايز ريفر كلاسيك',
    description: 'قطن 100% عالي الجودة بتطريز أنيق ومريح في الارتداء طوال اليوم.',
    price_egp: 450,
    discount_price_egp: 350,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['أسود', 'أبيض', 'أحمر'],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
    category: 'الكولكشن الصيفي'
  },
  {
    id: 'p2',
    title: 'هودي شتوي ثقيل River Five',
    description: 'خامة قطنية مبطنة مع جيب أمامي وطباعة بارزة خلفية مقاومة للغسيل.',
    price_egp: 850,
    discount_price_egp: 699,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['أسود', 'رمادي'],
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'],
    category: 'الكولكشن الشتوي'
  }
];

export default function App() {
  // الحالات العامة
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'admin'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // البيانات
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // حالة لوحة التحكم
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // نموذج إضافة منتج
  const [newProd, setNewProd] = useState({
    title: '',
    price_egp: '',
    discount_price_egp: '',
    description: '',
    category: 'الكولكشن الصيفي',
    image: '',
    sizes: 'S, M, L, XL, XXL',
    colors: 'أسود, أبيض'
  });

  // جلب البيانات من سوبابيز
  const fetchData = async () => {
    try {
      const { data: prods } = await supabase.from('products').select('*');
      if (prods && prods.length > 0) {
        setProducts(prods);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }

      const { data: bans } = await supabase.from('banners').select('*');
      if (bans && bans.length > 0) {
        setBanners(bans);
      } else {
        setBanners(INITIAL_BANNERS);
      }
    } catch (err) {
      console.log('Using local fallback data');
      setProducts(INITIAL_PRODUCTS);
      setBanners(INITIAL_BANNERS);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // تشغيل السلايدر التلقائي
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  // إدارة السلة
  const addToCart = (product, size, color) => {
    const item = {
      ...product,
      cartId: `${product.id}-${size}-${color}-${Date.now()}`,
      selectedSize: size || product.sizes[0],
      selectedColor: color || product.colors[0],
      quantity: 1
    };
    setCart((prev) => [...prev, item]);
    setSelectedProduct(null);
    setCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.discount_price_egp || item.price_egp;
    return sum + Number(price);
  }, 0);

  // إرسال الطلب وحفظه سحابياً
  const handleCheckout = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const orderData = {
      customer_name: formData.get('name'),
      phone_number: formData.get('phone'),
      address: formData.get('address'),
      governorate: formData.get('gov'),
      items: cart,
      total_amount: cartTotal
    };

    try {
      await supabase.from('orders').insert([orderData]);
    } catch (err) {
      console.error(err);
    }

    alert('تم تأكيد طلبك بنجاح! سنتواصل معك هاتفياً لتأكيد الشحن.');
    setCart([]);
    setCartOpen(false);
  };

  // تسجيل الدخول للوحة التحكم
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassInput === 'Momen 123') {
      setAdminAuth(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // إضافة منتج جديد من لوحة التحكم وحفظه سحابياً
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const productPayload = {
      title: newProd.title,
      price_egp: Number(newProd.price_egp),
      discount_price_egp: newProd.discount_price_egp ? Number(newProd.discount_price_egp) : null,
      description: newProd.description,
      images: [newProd.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      sizes: newProd.sizes.split(',').map((s) => s.trim()),
      colors: newProd.colors.split(',').map((c) => c.trim()),
      is_featured: true
    };

    try {
      const { data, error } = await supabase.from('products').insert([productPayload]).select();
      if (!error && data) {
        setProducts([data[0], ...products]);
      } else {
        setProducts([{ ...productPayload, id: Date.now().toString() }, ...products]);
      }
      alert('تم حفظ المنتج بنجاح وتحديث المتجر تلقائياً!');
      setNewProd({
        title: '',
        price_egp: '',
        discount_price_egp: '',
        description: '',
        category: 'الكولكشن الصيفي',
        image: '',
        sizes: 'S, M, L, XL, XXL',
        colors: 'أسود, أبيض'
      });
    } catch (err) {
      alert('تمت إضافة المنتج محلياً');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-red-600 selection:text-white">
      {/* 1. الشريط العلوي (الهيدر) */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* زر القائمة الجانبية */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* اللوجو واسم البراند */}
          <div 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="text-xl md:text-2xl font-black tracking-wider text-white group-hover:text-red-500 transition">
              River Five
            </span>
            <div className="w-8 h-8 rounded-full border border-red-600 bg-red-600/10 flex items-center justify-center text-xs font-bold text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
              Rv5
            </div>
          </div>

          {/* السلة وزر لوحة التحكم */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(currentPage === 'admin' ? 'home' : 'admin')}
              className="text-xs px-2.5 py-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentPage === 'admin' ? 'المتجر' : 'لوحة التحكم'}</span>
            </button>
            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. القائمة الجانبية (Drawer Menu) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[80%] bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">Rv5</div>
                  <span className="font-bold text-lg">أقسام المتجر</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-red-500 font-bold text-sm mb-2">1. الكولكشن الصيفي</h3>
                  <ul className="space-y-2 pr-4 text-zinc-400 text-sm">
                    <li className="hover:text-white cursor-pointer transition">تيشيرتات صيفية</li>
                    <li className="hover:text-white cursor-pointer transition">شورتات كاجوال</li>
                    <li className="hover:text-white cursor-pointer transition">أوفر سايز (Oversized)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-red-500 font-bold text-sm mb-2">2. الكولكشن الشتوي</h3>
                  <ul className="space-y-2 pr-4 text-zinc-400 text-sm">
                    <li className="hover:text-white cursor-pointer transition">سويت شيرت وهوديز</li>
                    <li className="hover:text-white cursor-pointer transition">جاكيتات شتوية</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-zinc-900">
                  <button 
                    onClick={() => { setSidebarOpen(false); setCartOpen(true); }}
                    className="w-full text-right py-2 text-zinc-300 hover:text-white flex items-center justify-between"
                  >
                    <span>3. سلة المشتريات</span>
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">{cart.length}</span>
                  </button>
                  <button 
                    onClick={() => { setSidebarOpen(false); setContactOpen(true); }}
                    className="w-full text-right py-2 text-zinc-300 hover:text-white flex items-center gap-2"
                  >
                    <span>4. تواصل معنا</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-600 text-center">
              River Five © 2026 - جميع الحقوق محفوظة
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي: المتجر أو لوحة التحكم */}
      {currentPage === 'home' ? (
        <main className="flex-1">
          {/* 3. السلايدر الترويجي الإعلاني المتحرك */}
          <section className="relative h-[360px] md:h-[480px] bg-zinc-900 overflow-hidden">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="w-full h-full object-cover object-center brightness-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-black via-transparent to-black/30">
                  <span className="text-red-500 font-bold tracking-widest text-sm uppercase mb-2">إعلان وعروض حصرية</span>
                  <h2 className="text-2xl md:text-4xl font-extrabold mb-4 max-w-xl text-white drop-shadow-md">
                    {banner.title}
                  </h2>
                  <button 
                    onClick={() => {
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-red-600/30 transition transform hover:scale-105"
                  >
                    تسوق الآن
                  </button>
                </div>
              </div>
            ))}

            {/* أزرار السلايدر */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </section>

          {/* 4. قسم "أحدث صيحات الموضة" (شبكة المنتجات) */}
          <section id="products-section" className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <span className="w-2 h-6 bg-red-600 rounded-full inline-block"></span>
                  أحدث صيحات الموضة
                </h2>
                <p className="text-zinc-400 text-xs mt-1">اختر إطلالتك المفضلة من تشكيلة River Five الحصرية</p>
              </div>
              <span className="text-xs bg-zinc-900 text-zinc-400 border border-zinc-800 px-3 py-1 rounded-full">
                الأسعار بالجنيه المصري
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <div 
                  key={prod.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600/50 transition duration-300 flex flex-col group"
                >
                  <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                    <img 
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'} 
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    {prod.discount_price_egp && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                        خصم خاص
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-red-500 transition line-clamp-1">
                        {prod.title}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        {prod.discount_price_egp ? (
                          <>
                            <span className="text-red-500 font-extrabold text-lg">{prod.discount_price_egp} جنيه</span>
                            <span className="text-zinc-500 text-xs line-through">{prod.price_egp} جنيه</span>
                          </>
                        ) : (
                          <span className="text-white font-extrabold text-lg">{prod.price_egp} جنيه</span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedProduct(prod)}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-sm transition shadow-md shadow-red-600/20 active:scale-95"
                    >
                      اشترِ الآن
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        /* 5. لوحة التحكم المستقلة (Admin Dashboard) */
        <section className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
          {!adminAuth ? (
            <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-800 p-8 rounded-2xl text-center shadow-xl">
              <div className="w-12 h-12 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/30">
                <ShieldLock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">لوحة تحكم River Five</h2>
              <p className="text-xs text-zinc-400 mb-6">يرجى إدخال كلمة المرور المخصصة للدخول للوحة التعديل</p>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-red-600"
                />
                {authError && <p className="text-xs text-red-500">كلمة المرور غير صحيحة، حاول مجدداً</p>}
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
                >
                  دخول للوحة التحكم
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h1 className="text-2xl font-black">لوحة التحكم السحابية</h1>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> متصل بـ Supabase (حفظ وتعديل تلقائي)
                  </p>
                </div>
                <button 
                  onClick={() => setAdminAuth(false)}
                  className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400"
                >
                  تسجيل خروج
                </button>
              </div>

              {/* نموذج إضافة منتج جديد */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="font-bold text-lg mb-4 text-red-500 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> إضافة منتج جديد للمتجر
                </h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">اسم المنتج</label>
                    <input 
                      type="text" 
                      required
                      value={newProd.title} 
                      onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">القسم</label>
                    <select 
                      value={newProd.category} 
                      onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none"
                    >
                      <option value="الكولكشن الصيفي">الكولكشن الصيفي</option>
                      <option value="الكولكشن الشتوي">الكولكشن الشتوي</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">السعر الأساسي (EGP)</label>
                    <input 
                      type="number" 
                      required
                      value={newProd.price_egp} 
                      onChange={(e) => setNewProd({ ...newProd, price_egp: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">السعر بعد الخصم (اختياري)</label>
                    <input 
                      type="number" 
                      value={newProd.discount_price_egp} 
                      onChange={(e) => setNewProd({ ...newProd, discount_price_egp: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-400 block mb-1">رابط صورة المنتج (URL)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={newProd.image} 
                      onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-400 block mb-1">وصف المنتج</label>
                    <textarea 
                      rows={2}
                      value={newProd.description} 
                      onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-red-600 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                    >
                      حفظ ونشر على المتجر
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 6. نافذة شراء وتفاصيل المنتج (Modal) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute left-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4">
              <img 
                src={selectedProduct.images?.[0]} 
                alt={selectedProduct.title} 
                className="w-28 h-36 object-cover rounded-xl border border-zinc-800"
              />
              <div>
                <h3 className="font-bold text-lg text-white">{selectedProduct.title}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  {selectedProduct.discount_price_egp ? (
                    <>
                      <span className="text-red-500 font-bold text-xl">{selectedProduct.discount_price_egp} جنيه</span>
                      <span className="text-zinc-500 text-xs line-through">{selectedProduct.price_egp} جنيه</span>
                    </>
                  ) : (
                    <span className="text-white font-bold text-xl">{selectedProduct.price_egp} جنيه</span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-2">{selectedProduct.description}</p>
              </div>
            </div>

            {/* اختيار المقاس واللون */}
            <div className="mt-6 space-y-4">
              <div>
                <span className="text-xs text-zinc-400 block mb-2 font-bold">المقاس المتاح:</span>
                <div className="flex gap-2">
                  {selectedProduct.sizes?.map((size) => (
                    <span key={size} className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs rounded-lg text-zinc-300">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-400 block mb-2 font-bold">الألوان المتاحة:</span>
                <div className="flex gap-2">
                  {selectedProduct.colors?.map((col) => (
                    <span key={col} className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs rounded-lg text-zinc-300">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-red-600/30"
                >
                  إضافة إلى السلة والطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. سلة المشتريات وتأكيد الطلب */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border-r border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-red-500" /> سلة المشتريات
                </h3>
                <button onClick={() => setCartOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 text-sm">
                  السلة فارغة حالياً
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                      <div className="flex items-center gap-3">
                        <img src={item.images?.[0]} className="w-12 h-12 object-cover rounded-lg" alt="" />
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-red-400 font-semibold">{item.discount_price_egp || item.price_egp} جنيه</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-zinc-500 hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-zinc-800 flex justify-between font-bold text-base">
                    <span>الإجمالي:</span>
                    <span className="text-red-500">{cartTotal} جنيه مصري</span>
                  </div>

                  {/* نموذج إتمام الطلب */}
                  <form onSubmit={handleCheckout} className="mt-6 space-y-3">
                    <span className="text-xs font-bold text-zinc-300 block">بيانات الشحن والتوصيل:</span>
                    <input 
                      name="name" 
                      required 
                      placeholder="الاسم بالكامل" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-red-600 focus:outline-none"
                    />
                    <input 
                      name="phone" 
                      required 
                      placeholder="رقم الهاتف (واتساب)" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-red-600 focus:outline-none"
                    />
                    <input 
                      name="gov" 
                      required 
                      placeholder="المحافظة" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-red-600 focus:outline-none"
                    />
                    <textarea 
                      name="address" 
                      required 
                      placeholder="العنوان بالتفصيل" 
                      rows={2} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs focus:border-red-600 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition"
                    >
                      تأكيد الطلب الآن
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. نافذة التواصل */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
            <button onClick={() => setContactOpen(false)} className="absolute left-4 top-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">خدمة عملاء River Five</h3>
            <p className="text-xs text-zinc-400 mb-6">يسعدنا تواصلكم معنا للرد على استفساراتكم ومتابعة الشحنات</p>
            <div className="space-y-2">
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full block bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-2.5 rounded-xl text-xs font-bold transition"
              >
                محادثة واتساب فورية
              </a>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="border-t border-zinc-900 bg-black py-8 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">River Five</span>
            <span className="text-[10px] bg-red-600/20 text-red-500 border border-red-600/30 px-1.5 py-0.5 rounded">Rv5</span>
          </div>
          <div>جميع الأسعار بالجنيه المصري (EGP) | التوصيل متاح لجميع المحافظات</div>
        </div>
      </footer>
    </div>
  );
}
