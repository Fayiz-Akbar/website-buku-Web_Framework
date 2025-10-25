import { useState, useEffect } from 'react';
import axios from 'axios';

// Komponen untuk menampilkan satu kartu buku
function BookCard({ book }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img 
        src={book.cover_image_url} 
        alt={`Cover of ${book.title}`} 
        className="w-full h-64 object-cover"
        // Menampilkan gambar placeholder jika link rusak
        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/480x640/1f2937/ffffff?text=No+Image"; }}
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-white truncate">{book.title}</h3>
        <p className="text-gray-400 mt-1">{book.author}</p>
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-500">{book.publisher}</p>
          <p className="text-sm font-semibold text-cyan-400">{book.year_published}</p>
        </div>
      </div>
    </div>
  );
}

// Komponen utama aplikasi
export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // useEffect akan berjalan saat komponen pertama kali dimuat atau saat currentPage berubah
  useEffect(() => {
    // Fungsi untuk mengambil data dari API Laravel
    const fetchBooks = async () => {
      setLoading(true);
      try {
        // Menggunakan Axios untuk request GET ke API kita, dengan parameter halaman
        const response = await axios.get(`http://127.0.0.1:8000/api/books?page=${currentPage}`);
        setBooks(response.data.data); // 'data' berisi array buku dari JSON
        setPagination({ // Menyimpan informasi pagination dari Laravel
          current_page: response.data.current_page,
          last_page: response.data.last_page,
        });
      } catch (error) {
        console.error("Gagal mengambil data buku:", error);
      }
      setLoading(false);
    };

    fetchBooks();
  }, [currentPage]); // Jalankan lagi setiap kali 'currentPage' berubah

  const goToNextPage = () => {
    if (currentPage < pagination.last_page) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-cyan-400">BookShelf</h1>
          <p className="text-gray-400 mt-2">Jelajahi Koleksi Buku Kami</p>
        </header>

        {loading ? (
          <div className="text-center text-2xl">Loading books...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            
            {/* Navigasi Paginasi */}
            <div className="flex justify-center items-center mt-12 space-x-4">
              <button 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="text-lg">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button 
                onClick={goToNextPage}
                disabled={currentPage === pagination.last_page}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

