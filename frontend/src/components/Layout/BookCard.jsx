import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

// Helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// --- Komponen Kartu Buku (Versi Profesional "Bersih") ---
// Tidak ada tombol 'Add to Cart' atau 'Favorite'
export default function BookCard({ book }) {

    const authorName = book.authors && book.authors.length > 0
        ? book.authors[0].full_name
        : 'Penulis';
    
    // Hitung diskon (jika ada)
    const discount = book.original_price ? Math.round(((book.original_price - book.price) / book.original_price) * 100) : 0;
    
    return (
        <Link to={`/books/${book.id}`} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col">
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
            </div>
            
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2 h-10">
                    {book.title}
                </h3>
                <p className="text-gray-600 text-xs mb-2 truncate">{authorName}</p>
                
                {/* Rating (Static) */}
                <div className="flex items-center mb-2 text-xs">
                    <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1 text-gray-700 font-semibold">4.8</span>
                    </div>
                    <span className="text-gray-400 ml-1">(120)</span>
                </div>
                
                {/* Spacer untuk mendorong harga ke bawah */}
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
                
                {/* Tombol diganti menjadi Lihat Detail */}
                <div className="w-full text-center mt-3 px-3 py-2 bg-blue-50 border-blue-600 border text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    Lihat Detail
                </div>
            </div>
        </Link>
    );
}

