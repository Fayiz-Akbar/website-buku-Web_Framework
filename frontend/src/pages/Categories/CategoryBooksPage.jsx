import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiPublic } from '../../api/axios';
import BookCard from '../../components/Layout/BookCard';
import { Loader2, AlertTriangle, Home } from 'lucide-react';

export default function CategoryBooksPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
  });

  const fetchCategoryBooks = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      // Mengambil data buku berdasarkan category_id
      const booksResponse = await apiPublic.get(`/books`, {
        params: {
          category_id: id,
          page: page,
          per_page: 18, // Jumlah buku per halaman
        },
      });
      
      setBooks(booksResponse.data.data || []);
      setPagination({
        currentPage: booksResponse.data.meta.current_page,
        lastPage: booksResponse.data.meta.last_page,
      });

      // Mengambil detail kategori (jika belum ada)
      if (!category) {
        const categoryResponse = await apiPublic.get(`/categories/${id}`);
        setCategory(categoryResponse.data.data);
      }

    } catch (err) {
      console.error("Error fetching category books:", err);
      if (err.response && err.response.status === 404) {
        setError('Kategori tidak ditemukan.');
      } else {
        setError('Gagal memuat data buku untuk kategori ini.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryBooks(1); // Fetch halaman pertama saat komponen dimuat
  }, [id]); // Jalankan ulang jika ID kategori berubah

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      fetchCategoryBooks(newPage);
      window.scrollTo(0, 0); // Scroll ke atas saat ganti halaman
    }
  };

  if (loading && !books.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="mx-auto w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b pb-4 mb-8">
        <nav className="text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to="/" className="hover:text-blue-600 flex items-center">
                <Home className="w-4 h-4 mr-1" /> Beranda
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="flex items-center">
              Kategori
            </li>
             <li className="mx-2">/</li>
            <li className="text-gray-800 font-medium" aria-current="page">
              {category?.name || 'Memuat...'}
            </li>
          </ol>
        </nav>
        <h1 className="text-4xl font-bold text-gray-800">
          Kategori: {category?.name || '...'}
        </h1>
      </div>

      {loading && <div className="text-center py-4">Memuat buku...</div>}

      {!loading && books.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">Tidak ada buku yang ditemukan dalam kategori ini.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {books.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2">
                Halaman {pagination.currentPage} dari {pagination.lastPage}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-4 py-2 border rounded-md disabled:opacity-50"
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