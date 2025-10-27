// frontend/src/pages/Books/BookListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/books';
const API_URL_ADMIN = 'http://localhost:8000/api/admin/books';
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

const BookListPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setBooks(response.data.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Gagal mengambil data buku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      try {
        await axios.delete(`${API_URL_ADMIN}/${id}`);
        fetchBooks();
      } catch (err) {
        console.error('Error deleting book:', err);
        alert('Gagal menghapus buku.');
      }
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-600">Memuat...</div>;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header aksi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Manajemen Buku</h1>
        <Link
          to="/admin/books/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Buku Baru
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