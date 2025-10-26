// Path: frontend/src/pages/BookDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Star, Heart, ArrowLeft, Info, Users, Calendar, Layers, Bookmark } from 'lucide-react';
import { useWishlist } from '../Context/WishlistContext';
import { useCart } from '../Context/CartContext';

// Helper format Rupiah
const formatRupiah = (number) => {
    // Konversi ke angka jika dia string
    const numericNumber = Number(number);
    if (isNaN(numericNumber)) {
        return 'Invalid Price';
    }
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(numericNumber);
};

export default function BookDetailPage() {
    const { id } = useParams(); 
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();
    
    const isFavorite = book ? isInWishlist(book.id) : false; 

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                // [FIX] Mengambil data dari API backend Anda
                const response = await axios.get(`http://localhost:8000/api/books/${id}`);
                // Data buku ada di dalam response.data.data (jika menggunakan Resource) atau response.data
                setBook(response.data.data || response.data); 
            } catch (err) {
                console.error("Error fetching book details:", err);
                setError('Gagal memuat detail buku. Mungkin buku tidak ditemukan.');
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]); 

    const handleToggleFavorite = () => {
        if (book) {
            toggleWishlist(book);
        }
    };

    const handleAddToCart = () => {
        if (book) {
            addToCart(book.id); 
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-10 max-w-lg mx-auto bg-red-100 text-red-700 rounded-lg shadow-md mt-10">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p>{error}</p>
                <Link 
                    to="/books" 
                    className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    if (!book) {
         return <div className="text-center p-10">Buku tidak ditemukan.</div>;
    }

    // [FIX] Sesuaikan dengan struktur JSON API Anda
    const authorNames = book.authors?.map(a => a.name || a.full_name).join(', ') || 'N/A';
    const publisherName = book.publisher?.name || 'N/A';
    const categoryNames = book.categories?.map(c => c.name).join(', ') || 'N/A';
    const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
    
    const placeholderImageUrl = `https://placehold.co/600x800/e2e8f0/64748b?text=${book.title.split(' ').slice(0,3).join('+')}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/books" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Katalog
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-1">
                    <div className="relative mb-6 shadow-lg rounded-lg overflow-hidden">
                        <img 
                            // --- PERBAIKAN UTAMA DI SINI ---
                            // Menggunakan 'book.cover_url' sesuai data API
                            src={book.cover_url || placeholderImageUrl} 
                            alt={book.title}
                            className="w-full h-auto object-cover" 
                            onError={(e) => { e.target.src = placeholderImageUrl; }} // Fallback
                        />
                         {discount > 0 && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-md shadow">
                                {discount}% OFF
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleAddToCart}
                            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors text-lg"
                        >
                            + Tambah ke Keranjang
                        </button>
                        <button 
                            onClick={handleToggleFavorite}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 border rounded-lg shadow-sm transition-colors ${
                                isFavorite 
                                ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            {isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2">
                     <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{book.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">
                        oleh <span className="font-medium text-blue-700">{authorNames}</span>
                    </p>
                    <div className="flex items-center mb-5">
                        <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-current' : ''}`} /> 
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600 text-sm">(4.8 | 120 Ulasan)</span>
                    </div>

                    <div className="mb-6">
                         {book.original_price > 0 && (
                            <span className="text-gray-500 text-lg line-through mr-3">
                                {formatRupiah(book.original_price)}
                            </span>
                        )}
                        <span className="text-3xl font-bold text-blue-700">
                            {formatRupiah(book.price)}
                        </span>
                    </div>

                    <div className="mb-8 prose max-w-none">
                        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Info className="w-5 h-5" /> Deskripsi</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {book.description || 'Deskripsi tidak tersedia.'}
                        </p>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Detail Buku</h3>
                        <div className="space-y-3 text-gray-700">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span><strong>Penulis:</strong> {authorNames}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-gray-500" />
                                <span><strong>Penerbit:</strong> {publisherName}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <span><strong>Tahun Terbit:</strong> {book.publication_year || book.published_year || 'N/A'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Bookmark className="w-5 h-5 text-gray-500" /> 
                                <span><strong>Kategori:</strong> {categoryNames}</span>
                            </div>
                            {book.isbn && (
                                <div className="flex items-center gap-3">
                                    <Info className="w-5 h-5 text-gray-500" />
                                    <span><strong>ISBN:</strong> {book.isbn}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}