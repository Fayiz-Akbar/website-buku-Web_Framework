// File: frontend/src/pages/Books/BookListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiAuth } from '../../api/axios'; 
// Tambahkan Loader2 dan AlertCircle untuk feedback visual
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'; 

const API_ENDPOINT = '/books'; // Rute publik

export default function BookListPage() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
    };

    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX: Menggunakan apiAuth karena ini adalah area Admin
            const response = await apiAuth.get(API_ENDPOINT); 
            setBooks(response.data.data);
        } catch (err) {
            console.error("Error fetching books:", err);
            setError("Gagal memuat daftar buku. Cek koneksi dan otorisasi.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus buku ini?")) return;
        try {
            await apiAuth.delete(`/admin/books/${id}`); 
            fetchBooks();
        } catch (err) {
            console.error("Error deleting book:", err);
            alert("Gagal menghapus buku. Cek hak akses Admin.");
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Buku</h1>
                <Link 
                    to="/admin/books/new" 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
                >
                    <Plus className="w-5 h-5 mr-1" /> Tambah Buku Baru
                </Link>
            </div>

            {/* FIX UI: Tabel dengan styling Tailwind CSS yang lebih baik */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbit</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {books.length > 0 ? books.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50 transition duration-100">
                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">{book.id}</td>
                                <td className="py-3 px-4 font-semibold text-gray-900">{book.title}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{book.authors?.map(a => a.name).join(', ') || 'N/A'}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{book.publisher?.name || 'N/A'}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-green-600">Rp {formatRupiah(book.price)}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">{book.stock}</td>
                                <td className="py-3 px-4 flex space-x-2 whitespace-nowrap">
                                    <Link 
                                        to={`/admin/books/edit/${book.id}`} 
                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100"
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(book.id)} 
                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center py-10 text-gray-500">Belum ada buku yang ditambahkan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}