// Path: frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiPublic as api } from "../api/axios";
import { 
    BookOpen, Tag, Award, Bookmark, Layers, Monitor, Loader2, 
    ChevronLeft, ChevronRight, ArrowRight, Truck, CreditCard, Store,
    Sparkles, TrendingUp
} from 'lucide-react';

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

import { useCart } from '../Context/CartContext'; 
import { useAuth } from './../Context/AuthContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import BookCard from '../components/Layout/BookCard'; 

// --- Komponen Kartu Kategori (Hover Disederhanakan) ---
function CategoryCard({ category }) {
    const getCategoryConfig = (categoryName) => {
        const name = categoryName?.toLowerCase() || '';
        const iconClass = "w-8 h-8"; // Ukuran ikon
        switch (name) {
            case 'teknologi':
                return { 
                    icon: <Monitor className={iconClass} />, 
                    color: 'text-blue-600', 
                    bgIcon: 'bg-blue-100'
                };
            case 'bisnis':
                return { 
                    icon: <Award className={iconClass} />, 
                    color: 'text-amber-600', 
                    bgIcon: 'bg-amber-100'
                };
            case 'desain':
                 return { 
                    icon: <Layers className={iconClass} />, 
                    color: 'text-purple-600', 
                    bgIcon: 'bg-purple-100'
                 };
            case 'pengembangan diri':
                return { 
                    icon: <Tag className={iconClass} />, 
                    color: 'text-green-600', 
                    bgIcon: 'bg-green-100'
                };
            default:
                return { 
                    icon: <Bookmark className={iconClass} />, 
                    color: 'text-rose-600', 
                    bgIcon: 'bg-rose-100'
                };
        }
    };

    const config = getCategoryConfig(category.name);

    return (
        <Link
            to={`/categories/${category.id}/books`} 
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-center group hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full"
        >
            <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${config.bgIcon} ${config.color} group-hover:bg-blue-100 group-hover:text-blue-600`}>
                {config.icon}
            </div>
            <h4 className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300 truncate w-full px-1">
                {category.name}
            </h4>
        </Link>
    );
}

// --- Komponen Utama Halaman Beranda ---
export default function HomePage() {
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth(); 

    const [latestBooks, setLatestBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleAddToCart = (bookId) => {
        if (!isLoggedIn) {
            alert("Anda harus login untuk menambahkan buku ke keranjang!");
            return;
        }
        addToCart(bookId, 1); 
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [latestBooksResponse, recommendedBooksResponse, categoriesResponse] = await Promise.all([
                    api.get('/books', { params: { limit: 12, sort: 'latest' } }), 
                    api.get('/books', { params: { limit: 10, sort: 'popular' } }),
                    api.get('/categories') 
                ]);

                setLatestBooks(latestBooksResponse.data.data || []);
                setRecommendedBooks(recommendedBooksResponse.data.data || []);
                setCategories(categoriesResponse.data.data || []);

            } catch (err) {
                console.error("Error fetching homepage data:", err.response || err);
                setError('Gagal memuat data. Periksa koneksi atau coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Banner dengan Ikon (bukan emoticon)
    const banners = [
        { 
            title: "Koleksi Terbaru!", 
            subtitle: "Temukan buku-buku baru setiap minggunya.", 
            bg: "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700", 
            link: "/books?sort=latest",
            icon: <BookOpen className="w-12 h-12 mb-4 opacity-80" /> // Menggunakan ikon Lucide
        },
        { 
            title: "Diskon Spesial", 
            subtitle: "Hemat hingga 50% untuk judul pilihan.", 
            bg: "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800", 
            link: "/books",
            icon: <Sparkles className="w-12 h-12 mb-4 opacity-80" /> // Menggunakan ikon Lucide
        },
        { 
            title: "Gratis Ongkir*", 
            subtitle: "Min. belanja Rp 100.000 (*S&K berlaku).", 
            bg: "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700", 
            link: "/books",
            icon: <Truck className="w-12 h-12 mb-4 opacity-80" /> // Menggunakan ikon Lucide
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-150px)] bg-white">
                <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                <p className="mt-4 text-gray-500 font-medium">Memuat data...</p>
            </div>
        );
    }

    if (error) {
        return (
             <div className="max-w-2xl mx-auto my-16 p-8 text-center bg-white rounded-xl shadow-lg border border-red-200">
                 <div className="text-5xl mb-4">🙁</div>
                 <h3 className="text-xl font-bold text-red-700 mb-2">Oops, Terjadi Kesalahan</h3>
                 <p className="text-red-600 text-sm leading-relaxed">{error}</p>
                 <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 text-sm">
                     Coba Lagi
                 </button>
             </div>
         );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            
            {/* --- 1. HERO CAROUSEL (Banner Promo) --- */}
            {/* Ini sekarang bagian paling atas */}
            <div className="bg-white shadow-sm border-b border-gray-200 pt-6 pb-8">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
                  <Swiper
                     modules={[Navigation, Pagination, Autoplay]}
                     spaceBetween={20}
                     slidesPerView={1}
                     navigation={{
                         nextEl: '.banner-next',
                         prevEl: '.banner-prev',
                     }}
                     pagination={{ clickable: true, dynamicBullets: true }}
                     autoplay={{ delay: 5000, disableOnInteraction: false }}
                     loop={true}
                     className="rounded-xl overflow-hidden shadow-lg"
                  >
                     {banners.map((banner, index) => (
                        <SwiperSlide key={index}>
                           <div className={`${banner.bg} text-white p-10 md:p-12 flex items-center justify-between min-h-[220px] relative`}>
                              <div className="max-w-md relative z-10">
                                   {banner.icon}
                                   <h2 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight drop-shadow">{banner.title}</h2>
                                   <p className="text-base md:text-lg opacity-90 mb-6">{banner.subtitle}</p>
                                   <Link 
                                       to={banner.link || "/books"} 
                                       className="inline-flex items-center gap-1.5 bg-white text-gray-900 px-5 py-2 font-semibold text-xs rounded-md hover:bg-gray-100 transition-colors shadow"
                                   >
                                       Lihat Promo <ArrowRight className="w-3 h-3" />
                                   </Link>
                              </div>
                              <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-white/10 opacity-50 hidden md:block" style={{clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)'}}></div>
                           </div>
                        </SwiperSlide>
                     ))}
                  </Swiper>
                  {/* Tombol Navigasi Kustom Banner */}
                  <button className="banner-prev absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2.5 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 backdrop-blur-sm">
                     <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="banner-next absolute top-1/2 -translate-y-1/2 right-2 z-10 p-2.5 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 backdrop-blur-sm">
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* --- 2. BAGIAN KATEGORI (Grid, Bukan Slider) --- */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
               <div className="flex items-center gap-3 mb-8">
                 <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Layers className="w-6 h-6 text-blue-600" />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800">
                    Jelajahi Kategori
                 </h2>
               </div>
               {categories.length > 0 ? (
                  // [PERBAIKAN] Menggunakan Grid, bukan Swiper
                  // Sesuaikan jumlah kolom (misal: lg:grid-cols-8) agar lebih pas
                  <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-15 gap-4">
                     {categories.map(category => (
                        <CategoryCard key={category.id} category={category} />
                     ))}
                  </div>
               ) : (
                  <p className="text-gray-500 text-center py-6 bg-gray-100 rounded-lg">Kategori tidak ditemukan.</p>
               )}
            </section>

            {/* --- 3. BAGIAN BUKU REKOMENDASI (POPULER) --- */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white rounded-2xl shadow-sm border border-gray-200">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                         <Sparkles className="w-6 h-6 text-amber-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Buku Paling Populer</h2>
                  </div>
                  <Link 
                      to="/books?sort=popular" 
                      className="text-amber-700 hover:text-amber-800 font-semibold text-xs flex items-center gap-1 bg-amber-100 px-4 py-2 rounded-lg hover:bg-amber-200 transition-all duration-300 group border border-amber-200"
                  >
                      Lihat Semua 
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
               </div>
               {recommendedBooks.length > 0 ? (
                  <div className="relative group">
                     <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={2}
                        navigation={{ nextEl: '.popular-next', prevEl: '.popular-prev' }}
                        autoplay={{ delay: 5000, disableOnInteraction: true }} 
                        breakpoints={{
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 4 },
                            1024: { slidesPerView: 5 },
                        }}
                     >
                        {recommendedBooks.map(book => (
                           <SwiperSlide key={book.id} className="pb-2 h-full">
                              <BookCard book={book} onAddToCart={handleAddToCart} /> 
                           </SwiperSlide>
                        ))}
                     </Swiper>
                     {/* Tombol Navigasi Kustom Populer */}
                      <button className="popular-prev absolute top-1/2 -translate-y-1/2 -left-4 z-10 p-2 bg-white rounded-full shadow border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0">
                         <ChevronLeft className="w-5 h-5" />
                      </button>
                     <button className="popular-next absolute top-1/2 -translate-y-1/2 -right-4 z-10 p-2 bg-white rounded-full shadow border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0">
                         <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
               ) : (
                  <p className="text-gray-500 text-center py-6 bg-gray-100 rounded-lg">Buku populer tidak ditemukan.</p>
               )}
            </section>

            {/* --- 4. BAGIAN BUKU TERBARU --- */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
               <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                         <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Baru Tiba</h2>
                  </div>
                  <Link 
                      to="/books?sort=latest" 
                      className="text-green-700 hover:text-green-800 font-semibold text-xs flex items-center gap-1 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-all duration-300 group border border-green-200"
                  >
                      Lihat Semua 
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
               </div>
               {latestBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5"> 
                     {latestBooks.map((book) => (
                        <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
                     ))}
                  </div>
               ) : (
                  <p className="text-gray-500 text-center py-6 bg-gray-100 rounded-lg">Buku terbaru tidak ditemukan.</p>
               )}
            </section>

            {/* --- 5. FITUR/BENEFIT SECTION --- */}
            <section className="bg-white border-t border-gray-200 py-16 mt-10">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-10 text-center">
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-5 shadow-inner">
                           <Truck className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold mb-2 text-base text-gray-800 uppercase tracking-wider">Pengiriman Cepat</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Gratis ongkir* dan buku sampai di tujuan dengan aman.</p>
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-5 shadow-inner">
                           <CreditCard className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold mb-2 text-base text-gray-800 uppercase tracking-wider">Pembayaran Aman</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Pilihan metode pembayaran lengkap dan terverifikasi.</p>
                     </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl mb-5 shadow-inner">
                           <Store className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold mb-2 text-base text-gray-800 uppercase tracking-wider">Toko Tersebar</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Kunjungi toko fisik kami di berbagai kota di Indonesia.</p>
                     </div>
                  </div>
               </div>
            </section>
        </div>
    );
}