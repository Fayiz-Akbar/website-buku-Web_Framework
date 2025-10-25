import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Heart, BookOpen, Tag, Award, Bookmark, Layers, Monitor } from 'lucide-react'; // Tambah ikon untuk kategori

// Import Swiper React components dan modulnya
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// --- Komponen Kartu Kategori ---
// Komponen baru untuk menampilkan kategori dengan ikon
function CategoryCard({ category }) {
    // Mapping ikon untuk kategori tertentu (bisa disesuaikan atau diambil dari API)
    const getCategoryIcon = (categoryName) => {
        switch (categoryName.toLowerCase()) {
            case 'fiksi': return <BookOpen className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'non-fiksi': return <Tag className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'bisnis & ekonomi': return <Award className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            case 'komputer & teknologi': return <Monitor className="w-10 h-10 text-blue-600 group-hover:text-white" />;
            default: return <Bookmark className="w-10 h-10 text-blue-600 group-hover:text-white" />; // Default ikon
        }
    };

    return (
        <Link
            to={`/category/${category.id}`} // Nanti ini akan ke halaman filter
            className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-32 p-4 bg-white rounded-lg shadow-md text-center group hover:bg-blue-600 hover:shadow-lg transition-all duration-300"
        >
            {getCategoryIcon(category.name)}
            <h4 className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-white truncate max-w-full">
                {category.name}
            </h4>
        </Link>
    );
}

// --- Komponen Kartu Buku (Versi Profesional) ---
function BookCard({ book }) {
    const [isFavorite, setIsFavorite] = useState(false);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const authorName = book.authors && book.authors.length > 0
        ? book.authors[0].full_name
        : 'Penulis';

    const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        alert(`"${book.title}" ditambahkan ke keranjang! (Fitur segera hadir)`);
    };

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        setIsFavorite(!isFavorite);
    };

    return (
        <Link to={`/books/${book.id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative overflow-hidden bg-gray-50">
                <img
                    src={book.cover_image_url || `https://placehold.co/300x400/e2e8f0/64748b?text=${book.title.split(' ').slice(0,3).join('+')}`}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}%
                    </div>
                )}
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                </button>
            </div>

            <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2 h-10">
                    {book.title}
                </h3>
                <p className="text-gray-600 text-xs mb-2 truncate">{authorName}</p>

                <div className="flex items-center mb-2 text-xs">
                    <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1 text-gray-700 font-semibold">4.8</span>
                    </div>
                    <span className="text-gray-400 ml-1">(120)</span>
                </div>

                <div className="mb-3">
                    {book.original_price > 0 && (
                        <div className="text-gray-400 text-xs line-through">
                            {formatRupiah(book.original_price)}
                        </div>
                    )}
                    <div className="text-blue-700 font-bold text-base">
                        {formatRupiah(book.price)}
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    + Keranjang
                </button>
            </div>
        </Link>
    );
}

// --- Komponen Halaman Utama (Konten) ---
export default function HomePage() {
    const [latestBooks, setLatestBooks] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]); // State baru untuk rekomendasi
    const [categories, setCategories] = useState([]); // State baru untuk kategori
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ambil semua data yang dibutuhkan secara paralel
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [latestBooksResponse, recommendedBooksResponse, categoriesResponse] = await Promise.all([
                    axios.get('http://localhost:8000/api/books?limit=12'), // Buku terbaru
                    axios.get('http://localhost:8000/api/books?limit=10&sort=popular'), // Asumsi ada API untuk buku populer/rekomendasi
                    axios.get('http://localhost:8000/api/categories')
                ]);

                setLatestBooks(latestBooksResponse.data.data || latestBooksResponse.data);
                setRecommendedBooks(recommendedBooksResponse.data.data || recommendedBooksResponse.data);
                setCategories(categoriesResponse.data.data || categoriesResponse.data);

            } catch (err) {
                console.error("Error fetching homepage data:", err);
                setError('Gagal memuat data. Pastikan backend berjalan dan endpoint tersedia.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Promo Banners
    const banners = [
        { title: "Diskon Hingga 50%", subtitle: "Untuk Buku Pilihan", bg: "bg-blue-600" },
        { title: "Gratis Ongkir", subtitle: "Min. Belanja Rp 100.000", bg: "bg-green-600" }
    ];

    if (loading) {
        return <div className="text-center p-20 text-xl font-semibold">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-20 text-red-600 bg-red-100 rounded-lg">{error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-16rem)]"> {/* Min-height agar footer tetap di bawah */}
            {/* Promo Banners */}
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

            {/* --- BAGIAN KATEGORI (Carousel) --- */}
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
                            <SwiperSlide key={category.id} className="py-5"> {/* Padding vertikal untuk pagination */}
                                <CategoryCard category={category} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada kategori ditemukan.</p>
                )}
            </div>

            {/* --- BAGIAN BUKU REKOMENDASI (Carousel) --- */}
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
                        {recommendedBooks.map(book => (
                            <SwiperSlide key={book.id} className="py-1">
                                <BookCard book={book} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada buku rekomendasi ditemukan.</p>
                )}
            </div>

            {/* --- BAGIAN BUKU TERBARU (Grid Biasa) --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">Buku Terbaru</h2>
                    <Link to="/books" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Lihat Semua →
                    </Link>
                </div>
                {latestBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {latestBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">Tidak ada buku terbaru ditemukan.</p>
                )}
            </div>

            {/* Info Section */}
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

