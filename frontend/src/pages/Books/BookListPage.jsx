// frontend/src/pages/Books/BookListPage.jsx

import React, { useState, useEffect } from 'react'; // 1. Import hooks
import { Link } from 'react-router-dom';
import axios from 'axios'; // 2. Import axios

// 3. Definisikan URL API
const API_URL = 'http://localhost:8000/api/books';
const API_URL_ADMIN = 'http://localhost:8000/api/admin/books';

const BookListPage = () => {
    // 4. Buat state untuk data, loading, dan error
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 5. Buat fungsi untuk mengambil data
    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL);
            // Data dari backend paginasi ada di 'response.data.data'
            setBooks(response.data.data); 
        } catch (err) {
            console.error("Error fetching books:", err);
            setError("Gagal mengambil data buku.");
        } finally {
            setLoading(false);
        }
    };

    // 6. Panggil fetchBooks() saat komponen pertama kali di-load
    useEffect(() => {
        fetchBooks();
    }, []);

    // 7. Buat fungsi untuk menghapus
    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
            try {
                // --- GUNAKAN API_URL_ADMIN DI SINI ---
                await axios.delete(`${API_URL_ADMIN}/${id}`); 
                // ------------------------------------
                fetchBooks(); 
            } catch (err) {
                console.error("Error deleting book:", err);
                alert("Gagal menghapus buku.");
            }
        }
    };

    // 8. Tampilkan status loading atau error
    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="p-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Buku</h1>
                <Link
                    to="/admin/books/create"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-150"
                >
                    + Tambah Buku Baru
                </Link>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {/* 9. Sesuaikan Kolom Tabel */}
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* 10. Ganti 'dummyBooks' menjadi 'books' */}
                        {books.length > 0 ? (
                            books.map((book) => (
                                <tr key={book.id}>
                                    {/* Tampilkan data asli dari API */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img 
                                            src={book.cover_image_url || 'https://via.placeholder.com/80x120'} 
                                            alt={book.title}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Tampilkan relasi many-to-many */}
                                        {book.authors.map(a => a.name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {book.categories.map(c => c.name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        Rp {new Intl.NumberFormat('id-ID').format(book.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <Link to={`/admin/books/edit/${book.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        {/* Tambahkan onClick ke tombol Hapus */}
                                        <button 
                                            onClick={() => handleDelete(book.id)} 
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    Belum ada data buku.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookListPage;