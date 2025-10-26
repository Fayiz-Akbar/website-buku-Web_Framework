import React from 'react';
import { useWishlist } from '../Context/WishlistContext'; // Path sudah benar
import { Link } from 'react-router-dom';
import { Loader2, HeartCrack } from 'lucide-react';
import BookCard from '../components/Layout/BookCard.jsx'; // Sesuaikan path jika beda

export default function WishlistPage() {
    const { wishlistItems, loading } = useWishlist();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="text-center p-10 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10">
                 <HeartCrack className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Daftar Favorit Kosong</h2>
                <p className="text-gray-600 mb-6">
                    Anda belum menambahkan buku ke daftar favorit.
                </p>
                <Link 
                    to="/books" 
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                >
                    Cari Buku
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Buku Favorit Saya</h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {wishlistItems.map(book => (
                    // Pastikan BookCard menerima prop 'book'
                    <BookCard key={book.id} book={book} /> 
                ))}
            </div>
        </div>
    );
}
