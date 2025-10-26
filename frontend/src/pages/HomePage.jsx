// Path: frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// [PERBAIKAN 1] Ganti axios dengan API client terpusat
import { apiPublic as api } from "../api/axios";
// Import lucide-react icons (sudah ada)
import { BookOpen, Tag, Award, Bookmark, Layers, Monitor, Loader2 } from 'lucide-react';

// Import Swiper React components dan modulnya (sudah ada)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// [PERBAIKAN 2] Import Contexts untuk Cart dan Auth
import { useCart } from '../Context/CartContext'; 
import { useAuth } from './../context/AuthContext';

// Import Swiper styles (sudah ada)
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// --- IMPORT DARI FILE TERPISAH ---
// Asumsi BookCard menerima prop 'onAddToCart'
import BookCard from '../components/Layout/BookCard'; 

// --- Komponen Kartu Kategori (Dibuat di sini untuk konsistensi) ---
function CategoryCard({ category }) {
    // ... (Kode CategoryCard tetap sama) ...
    const getCategoryIcon = (categoryName) => {
        switch (categoryName.toLowerCase()) {
            case 'fiksi': return <BookOpen className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'non-fiksi': return <Tag className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'bisnis & ekonomi': return <Award className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'komputer & teknologi': return <Monitor className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            default: return <Bookmark className="w-10 h-10 text-blue-600 group-hover:text-white" />;
        }
    };

    return (
        <Link
            to={`/category/${category.id}`} 
            className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-32 p-4 bg-white rounded-lg shadow-md text-center group hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
        >
            {getCategoryIcon(category.name)}
            <h4 className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-white truncate max-w-full">
                {category.name}
            </h4>
        </Link>
    );
}

// --- Komponen Halaman Utama (Konten) ---
export default function HomePage() {
    // [PERBAIKAN 3] Gunakan hook useCart dan useAuth
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth(); 

    const [latestBooks, setLatestBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // [PERBAIKAN 4] Handler Add to Cart
    const handleAddToCart = (bookId) => {
        if (!isLoggedIn) {
            alert("Anda harus login untuk menambahkan buku ke keranjang!");
            return;
        }
        
        // Panggil fungsi global addToCart dari CartContext
        addToCart(bookId, 1); 
    };


    // [PERBAIKAN 5] useEffect untuk Fetching Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // [PERBAIKAN 6] Gunakan API client terpusat (api)
                const [latestBooksResponse, recommendedBooksResponse, categoriesResponse] = await Promise.all([
                    api.get('/books?limit=12'), // Ganti axios.get
                    api.get('/books?limit=10&sort=popular'), // Ganti axios.get
                    api.get('/categories') // Ganti axios.get
                ]);

                // Pastikan data diambil dari response.data.data
                setLatestBooks(latestBooksResponse.data.data || []);
                setRecommendedBooks(recommendedBooksResponse.data.data || []);
                setCategories(categoriesResponse.data.data || []);

            } catch (err) {
                console.error("Error fetching homepage data:", err.response || err);
                setError('Gagal memuat data. Pastikan backend berjalan dan endpoint tersedia.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const banners = [
        { title: "Diskon Hingga 50%", subtitle: "Untuk Buku Pilihan", bg: "bg-blue-600" },
        { title: "Gratis Ongkir", subtitle: "Min. Belanja Rp 100.000", bg: "bg-green-600" }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-20 text-red-600 bg-red-100 rounded-lg">{error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-16rem)]">
            {/* Promo Banners (Sama) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid md:grid-cols-2 gap-4">
                    {banners.map((banner, index) => (
                        <div key={index} className={`${banner.bg} text-white p-8 rounded-lg flex items-center justify-between`}>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{banner.title}</h3>
                                <p className="text-sm opacity-90">{banner.subtitle}</p>
                            </div>
                            <Link to="/books" className="bg-white text-gray-800 px-6 py-2 font-semibold text-sm rounded-md hover:bg-gray-100">
                                BELANJA
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* BAGIAN KATEGORI (Sama) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Jelajahi Kategori
                </h2>
                {categories.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={15}
                        slidesPerView={2}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 20 },
                            768: { slidesPerView: 4, spaceBetween: 20 },
                            1024: { slidesPerView: 6, spaceBetween: 20 },
                            1280: { slidesPerView: 7, spaceBetween: 20 },
                        }}
                        className="mySwiper"
                    >
                        {categories.map(category => (
                            <SwiperSlide key={category.id} className="py-5">
                                <CategoryCard category={category} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada kategori ditemukan.</p>
                )}
            </div>

            {/* BAGIAN BUKU REKOMENDASI */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Rekomendasi Buku
                </h2>
                {recommendedBooks.length > 0 ? (
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={15}
                        slidesPerView={2}
                        navigation
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 3, spaceBetween: 20 },
                            768: { slidesPerView: 4, spaceBetween: 20 },
                            1024: { slidesPerView: 5, spaceBetween: 20 },
                        }}
                        className="mySwiper"
                    >
                        {/* [PERBAIKAN 7] Pasang handler ke BookCard */}
                        {recommendedBooks.map(book => (
                            <SwiperSlide key={book.id} className="py-1">
                                <BookCard book={book} onAddToCart={handleAddToCart} /> 
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada buku rekomendasi ditemukan.</p>
                )}
            </div>

            {/* BAGIAN BUKU TERBARU */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">Buku Terbaru</h2>
                    <Link to="/books" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Lihat Semua →
                    </Link>
                </div>
                {latestBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* [PERBAIKAN 7] Pasang handler ke BookCard */}
                        {latestBooks.map((book) => (
                            <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada buku terbaru ditemukan.</p>
                )}
            </div>

            {/* Info Section (Sama) */}
            <div className="bg-white border-t border-b py-8 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-blue-600 text-4xl mb-3">📦</div>
                            <h3 className="font-bold mb-2 text-gray-800">GRATIS ONGKIR</h3>
                            <p className="text-sm text-gray-600">Untuk pembelian di atas Rp 100.000</p>
                        </div>
                        <div>
                            <div className="text-blue-600 text-4xl mb-3">💳</div>
                            <h3 className="font-bold mb-2 text-gray-800">PEMBAYARAN AMAN</h3>
                            <p className="text-sm text-gray-600">Berbagai metode pembayaran tersedia</p>
                        </div>
                        <div>
                            <div className="text-blue-600 text-4xl mb-3">🏪</div>
                            <h3 className="font-bold mb-2 text-gray-800">100+ TOKO</h3>
                            <p className="text-sm text-gray-600">Tersebar di seluruh Indonesia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}