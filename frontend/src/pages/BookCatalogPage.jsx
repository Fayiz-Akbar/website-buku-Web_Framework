// Path: frontend/src/pages/BookCatalogPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, Filter } from 'lucide-react';
// --- PERBAIKAN DI SINI ---
import BookCard from '../components/Layout/BookCard.jsx'; 

export default function BookCatalogPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // State untuk filter (masih placeholder)
    const [searchTerm, setSearchTerm] = useState('');

    // Fungsi untuk mengambil data buku
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                // Panggil API dengan parameter page
                const response = await axios.get(`http://localhost:8000/api/books`, {
                    params: {
                        page: currentPage,
                        search: searchTerm // (Fitur search, jika backend support)
                    }
                });
                
                setBooks(response.data.data); // data buku
                setTotalPages(response.data.last_page); // total halaman dari pagination Laravel
                setCurrentPage(response.data.current_page); // halaman saat ini

            } catch (err) {
                console.error("Error fetching books:", err);
                setError('Gagal memuat data buku.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [currentPage, searchTerm]); // Jalankan ulang jika halaman atau searchTerm berubah

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset ke halaman 1 saat search
        // Biarkan useEffect yang mentrigger fetch ulang
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Katalog Buku</h1>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-grow">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul atau penulis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </form>
                {/* Filter Button (Placeholder) */}
                <button className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                </button>
            </div>

            {/* Tampilan Konten */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="text-center p-10 text-red-600 bg-red-100 rounded-lg">{error}</div>
            ) : (
                <>
                    {/* Grid Buku */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {books.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-10">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border rounded-lg shadow-sm disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>
                        <span className="font-medium">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border rounded-lg shadow-sm disabled:opacity-50"
                        >
                            Berikutnya
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}