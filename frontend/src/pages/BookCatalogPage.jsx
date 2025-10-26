// Path: frontend/src/pages/BookCatalogPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Filter } from 'lucide-react'; // Hapus 'Search' jika tidak dipakai
import BookCard from '../components/Layout/BookCard.jsx';
// (1) Import useSearchParams untuk membaca URL
import { useSearchParams } from 'react-router-dom';

export default function BookCatalogPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // (2) Gunakan useSearchParams untuk mendapatkan query 'q' dari URL
    const [searchParams] = useSearchParams();
    const searchQueryFromUrl = searchParams.get('q') || '';

    // Fungsi untuk mengambil data buku
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError(null);
            try {
                // (3) Kirim parameter 'q' ke API
                const response = await axios.get(`http://localhost:8000/api/books`, {
                    params: {
                        page: currentPage,
                        q: searchQueryFromUrl // Kirim query dari URL ke backend
                    }
                });
                
                // Pastikan struktur respons API sesuai
                setBooks(response.data.data); 
                setTotalPages(response.data.meta?.last_page || 1); 
                setCurrentPage(response.data.meta?.current_page || 1); 

            } catch (err) {
                console.error("Error fetching books:", err);
                setError('Gagal memuat data buku.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    // (4) Jalankan ulang useEffect jika halaman atau query pencarian berubah
    }, [currentPage, searchQueryFromUrl]); 

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* (5) Judul halaman dinamis berdasarkan pencarian */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {searchQueryFromUrl 
                    ? `Hasil Pencarian: "${searchQueryFromUrl}"` 
                    : 'Katalog Buku'}
            </h1>
            
            {/* Search bar di tengah sudah dihapus sesuai permintaan */}

            {/* Tombol Filter (jika masih diperlukan) */}
            <div className="flex justify-end mb-4">
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
                    {/* (6) Tampilkan pesan jika tidak ada hasil */}
                    {books.length === 0 ? (
                        <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg">
                            Tidak ada buku yang cocok dengan pencarian "{searchQueryFromUrl}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {books.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {/* Tampilkan pagination hanya jika ada buku dan lebih dari 1 halaman */}
                    {books.length > 0 && totalPages > 1 && (
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
                    )}
                </>
            )}
        </div>
    );
}