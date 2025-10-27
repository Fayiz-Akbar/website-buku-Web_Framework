// Path: frontend/src/components/Layout/BookCard.jsx
import React from 'react'; 
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react'; 
import { useWishlist } from '../../Context/WishlistContext';
import { useCart } from '../../Context/CartContext'; 
import { useToast } from '../Toast/ToastProvider';

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

export default function BookCard({ book }) {
    const { toggleWishlist, isInWishlist } = useWishlist(); 
    const { addToCart } = useCart(); 
    const { success, error } = useToast();
    const isFavorite = isInWishlist(book.id);

    // [FIX] Menggunakan 'authors' (array) dan 'full_name' atau 'name'
    const authorName = book.authors && book.authors.length > 0
        ? book.authors.map(a => a.full_name || a.name).join(', ')
        : (book.author ? (book.author.full_name || book.author.name) : 'Penulis');
    
    const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
    
    const handleToggleFavorite = (e) => {
        e.preventDefault(); 
        toggleWishlist(book);
    };

    const handleAddToCart = async (e) => {
        e.preventDefault(); // Mencegah navigasi ke detail buku
        try {
            await Promise.resolve(addToCart(book.id));
            success(`"${book.title}" ditambahkan ke keranjang`);
        } catch (err) {
            console.error(err);
            error('Gagal menambahkan ke keranjang');
        }
    };
    
    const placeholderImage = `https://placehold.co/300x400/e2e8f0/64748b?text=${book.title.split(' ').slice(0,3).join('+')}`;

    return (
        <Link to={`/books/${book.id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
            <div className="relative overflow-hidden bg-gray-50">
                <img
                    // --- PERBAIKAN UTAMA DI SINI ---
                    // Menggunakan 'book.cover_url' sesuai data API
                    src={book.cover_url || placeholderImage}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    // Fallback jika URL dari API gagal dimuat
                    onError={(e) => { e.target.src = placeholderImage; }}
                />
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}%
                    </div>
                )}
                 {/* Tombol Wishlist (Hati) Tetap ada */}
                 <button
                    onClick={handleToggleFavorite}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50 z-10"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                </button>
            </div>
            
            <div className="p-3 flex flex-col flex-grow">
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
                
                <div className="flex-grow"></div>

                <div className="mt-2">
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
                    className="w-full flex items-center justify-center gap-2 text-center mt-3 px-3 py-2 bg-blue-600 border-blue-600 border text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                    <ShoppingCart className="w-4 h-4" />
                    + Keranjang
                </button>
            </div>
        </Link>
    );
}