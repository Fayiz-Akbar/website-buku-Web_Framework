// frontend/src/pages/Books/BookListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/books';
const API_URL_ADMIN = 'http://localhost:8000/api/admin/books';

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

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Cover</th>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Penulis</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Harga</th>
                <th className="px-6 py-3">Stok</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={book.cover_image_url || 'https://via.placeholder.com/80x120'}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-md border border-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {book.authors.map((a) => a.name).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {book.categories.map((c) => c.name).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      Rp {new Intl.NumberFormat('id-ID').format(book.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{book.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/admin/books/edit/${book.id}`}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-md"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                    Belum ada data buku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookListPage;