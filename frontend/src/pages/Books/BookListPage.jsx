// frontend/src/pages/Books/BookListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';

const API_URL = 'http://localhost:8000/api/books';
const API_URL_ADMIN = 'http://localhost:8000/api/admin/books';
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

// Helper: bentuk URL gambar yang valid dari berbagai kemungkinan field cover
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const toImageUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const normalized = String(pathOrUrl).replace(/^\/?storage\/?/i, '');
  return `${API_BASE_URL}/storage/${normalized}`;
};
const getCoverSrc = (book) =>
  book.cover_url ||
  toImageUrl(book.cover) ||
  toImageUrl(book.cover_path) ||
  toImageUrl(book.cover_image) ||
  toImageUrl(book.image);

export default function BookListPage() {
  const [books, setBooks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deletingId, setDeletingId] = React.useState(null);

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

  const handleDelete = async (book) => {
    const ok = window.confirm(`Hapus buku "${book.title}"?`);
    if (!ok) return;
    setDeletingId(book.id);
    try {
      await api.delete(`/books/${book.id}`); // soft delete
      setBooks((prev) => prev.filter((b) => b.id !== book.id));
    } catch (e) {
      alert('Gagal menghapus buku. Coba lagi.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-600">Memuat...</div>;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manajemen Buku</h1>
        <Link
          to="/admin/books/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Buku Baru
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-left text-gray-600 text-sm">
                <th className="px-4 py-3 w-[80px]">Cover</th>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Penulis</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {books?.map((book) => {
                const imgSrc = getCoverSrc(book);
                return (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={book.title || 'Cover'}
                          className="h-14 w-10 object-cover rounded border bg-gray-100"
                          onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                        />
                      ) : (
                        <div className="h-14 w-10 bg-gray-100 border rounded grid place-content-center text-[10px] text-gray-400">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{book.title}</div>
                      
                    </td>
                    <td className="px-4 py-3">{book.author?.name || book.author_name || '-'}</td>
                    <td className="px-4 py-3">{book.category?.name || book.category_name || '-'}</td>
                    <td className="px-4 py-3">
                      {typeof book.price === 'number'
                        ? book.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
                        : book.price || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => /* navigate to edit */ {}}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book)}
                          disabled={deletingId === book.id}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded disabled:opacity-50"
                        >
                          {deletingId === book.id ? 'Menghapus...' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!books || books.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
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