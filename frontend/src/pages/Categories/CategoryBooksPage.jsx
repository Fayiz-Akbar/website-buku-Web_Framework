import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiPublic as api } from "../../api/axios";
import BookCard from "../../components/Layout/BookCard";
import { Loader2 } from "lucide-react";

export default function CategoryBooksPage() {
  const { id } = useParams(); // id kategori dari URL
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil detail kategori
        const catRes = await api.get(`/categories/${id}`);
        // Ambil buku berdasarkan kategori
        // Jika backend sudah dukung filter: /books?category_id=ID
        const booksRes = await api.get(`/books`, { params: { category_id: id, limit: 24 } });

        if (!mounted) return;
        setCategory(catRes.data?.data || catRes.data);
        // adaptasi struktur response
        setBooks(booksRes.data?.data || booksRes.data?.books || booksRes.data || []);
      } catch (e) {
        if (!mounted) return;
        console.error(e);
        setError("Gagal memuat kategori/buku. Pastikan endpoint tersedia.");
      } finally {
        mounted && setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Kategori: {category?.name || "-"}
        </h1>
        <Link to="/books" className="text-blue-600 hover:text-blue-700 text-sm">
          Lihat semua buku →
        </Link>
      </div>

      {books?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Belum ada buku untuk kategori ini.</p>
      )}
    </div>
  );
}