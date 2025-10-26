import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { apiPublic as api } from "../../api/axios";
import BookCard from "../../components/Layout/BookCard";
import { Loader2, ChevronRight, List, ArrowUpDown, Tag } from "lucide-react";

export default function CategoryBooksPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE ---
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');

  // --- FUNGSI AMBIL DATA ---
  const loadData = useCallback(async (currentSortBy) => {
    setLoading(true);
    setError(null);
    let mounted = true; 
    try {
      const [catRes, allCatsRes] = await Promise.all([
        api.get(`/categories/${id}`),
        api.get(`/categories`)
      ]);

      if (!mounted) return;
      setCategory(catRes.data?.data || catRes.data);
      setAllCategories(allCatsRes.data?.data || allCatsRes.data || []);

      const booksRes = await api.get(`/books`, {
        params: {
          category_id: id,
          limit: 30, 
          sort: currentSortBy 
        }
      });

      if (!mounted) return;
      setBooks(booksRes.data?.data || booksRes.data?.books || booksRes.data || []);

    } catch (e) {
      if (!mounted) return;
      console.error(e);
      setError("Gagal memuat data. Pastikan backend berjalan.");
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  }, [id]);

  // --- EFEK UNTUK MEMUAT DATA AWAL & SAAT SORT BERUBAH ---
  useEffect(() => {
    loadData(sortBy); 
  }, [id, sortBy, loadData]);

  // --- FUNGSI HANDLE SORTING ---
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setSearchParams({ sort: newSort });
  };


  // --- TAMPILAN LOADING ---
  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // --- TAMPILAN ERROR ---
  if (error) {
    return <div className="text-center p-10 text-red-600 bg-red-100 rounded-lg max-w-7xl mx-auto my-10">{error}</div>;
  }

  const sortOptions = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'popular', label: 'Populer' },
    { value: 'price_asc', label: 'Harga Terendah' },
    { value: 'price_desc', label: 'Harga Tertinggi' },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen">
      {/* --- HERO SECTION --- */}
      <div className="bg-white pt-8 pb-10 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-700 transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            <Link to="/books" className="hover:text-blue-700 transition-colors">Katalog</Link>
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            <span className="font-semibold text-blue-600">{category?.name || "Kategori"}</span>
          </nav>
          {/* Judul & Deskripsi */}
          <div className="flex items-center gap-3">
             <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Tag className="w-6 h-6"/>
             </span>
             <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
                {category?.name || "Memuat Kategori..."}
             </h1>
          </div>
        </div>
      </div>

      {/* --- KONTEN UTAMA DENGAN SIDEBAR --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* --- (PERBAIKAN DI SINI) --- */}
          {/* Tambahkan class 'sticky' dan 'top-24' (sesuaikan 24 jika perlu) */}
          <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-24 self-start">
          {/* 'self-start' penting agar container <aside> tidak stretching */}
          {/* --- BATAS PERBAIKAN --- */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <List className="w-5 h-5 text-gray-500" />
                Semua Kategori
              </h3>
              <nav className="space-y-1.5">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      cat.id == id
                        ? 'bg-blue-600 text-white shadow-sm scale-[1.02]'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:pl-4'
                    }`}
                  >
                    {cat.name}
                    {cat.id == id && <ChevronRight className="w-4 h-4 ml-auto opacity-70"/>}
                  </Link>
                ))}
                <Link
                  to="/books"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:pl-4 border-t mt-3 pt-3"
                >
                  Lihat Semua Buku
                </Link>
              </nav>
            </div>
          </aside>

          {/* --- AREA KONTEN BUKU (KANAN) --- */}
          <main className="flex-1 min-w-0">
            {/* --- Header Konten (Jumlah & Sorting) --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Menampilkan {loading ? '...' : books.length} Buku
              </h2>
              {/* Dropdown Sorting */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* --- Grid Buku --- */}
            {loading && books.length > 0 ? ( 
              <div className="relative">
                 <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 opacity-50">
                   {books.map((book) => ( <BookCard key={book.id} book={book} /> ))}
                 </div>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              // Tampilan jika tidak ada buku
              <div className="flex flex-col justify-center items-center text-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                 <Tag className="w-16 h-16 text-gray-300 mb-4"/>
                 <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops!</h3>
                 <p className="text-gray-500">
                    Sepertinya belum ada buku untuk kategori "{category?.name}".
                 </p>
                 <Link to="/books" className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition-colors text-sm">
                    Jelajahi Kategori Lain
                 </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}