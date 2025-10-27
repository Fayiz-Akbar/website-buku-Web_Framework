// frontend/src/components/Layout/UserLayout.jsx
import React, { useState, useEffect } from "react";
// (1) Pastikan useNavigate di-import
import { Link, Outlet, useNavigate } from "react-router-dom"; 
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Heart,
  LogOut,
  Facebook,
  Instagram,
  Twitter,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";

export default function UserLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, logout, isLoggedIn } = useAuth();
  
  // (2) Inisialisasi useNavigate
  const navigate = useNavigate();

  // (3) State baru untuk menyimpan query pencarian
  const [searchQuery, setSearchQuery] = useState("");

  // Ambil kategori dari API
  useEffect(() => {
    let isMounted = true;
    axios
      .get("http://localhost:8000/api/categories")
      .then((res) => {
        if (isMounted) setCategories(res.data.data || res.data);
      })
      .catch((err) => console.error("Gagal mengambil kategori:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
  };
  
  // (4) Fungsi baru untuk menangani submit form pencarian
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigasi ke halaman katalog dengan query parameter 'q'
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Jika kosong, navigasi ke halaman katalog tanpa query
      navigate("/books");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="bg-gray-100 text-gray-700 text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +62 123 4567 890
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> support@bookhaven.com
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Lacak Pesanan
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-bold text-blue-600">
              BookHaven
            </Link>
          </div>

          {/* (5) MODIFIKASI SEARCH BAR */}
          {/* Ubah <div> menjadi <form> dan tambahkan onSubmit */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari judul buku, penulis..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                // Hubungkan ke state
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit" // Pastikan type="submit"
                className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          {/* --- BATAS MODIFIKASI --- */}


          {/* Ikon kanan */}
          <div className="flex items-center gap-4">
            <Link
              to="/wishlist"
              className="text-gray-600 hover:text-blue-600"
            >
              <Heart className="w-6 h-6" />
            </Link>
            <Link
              to="/cart"
              className="text-gray-600 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {/* Tombol Login/User Dropdown */}
            <div className="relative">
              {isLoggedIn ? (
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                >
                  <User className="w-6 h-6" />
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Masuk
                </Link>
              )}

              {/* Dropdown Menu */}
              {isDropdownOpen && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.full_name || "Pengguna"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "email@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profil Saya
                  </button>
                  <button
                    onClick={() => handleNavigate("/profile/orders")}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Pesanan Saya
                  </button>
                  {user?.role === 'admin' && (
                     <button
                        onClick={() => handleNavigate("/admin/dashboard")}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 font-medium hover:bg-gray-100"
                    >
                        Ke Dashboard Admin
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Keluar
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Mobile Menu */}
            <button
              className="md:hidden text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-0 inset-x-0 p-2 transition transform origin-top-right z-50">
             {/* ... (Konten mobile menu, tidak berubah) ... */}
          </div>
        )}
      </header>

      {/* ===== NAV KATEGORI ===== */}
      <nav className="bg-white border-b shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-8 h-12 items-center">
            {categories.slice(0, 7).map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}/books`}
                className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/books"
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== KONTEN UTAMA ===== */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white pt-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Tentang */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">BookHaven</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Toko buku online tepercaya Anda. Menyediakan ribuan judul buku 
              dari berbagai kategori untuk mencerahkan hari Anda.
            </p>
          </div>
          {/* Kolom 2: Tautan Cepat */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-white">Beranda</Link></li>
              <li><Link to="/books" className="text-gray-400 hover:text-white">Katalog Buku</Link></li>
              <li><Link to="/profile/orders" className="text-gray-400 hover:text-white">Pesanan Saya</Link></li>
              <li><Link to="/profile" className="text-gray-400 hover:text-white">Akun Saya</Link></li>
            </ul>
          </div>
          {/* Kolom 3: Kategori Populer */}
          <div>
             <h4 className="text-lg font-semibold mb-4">Kategori</h4>
             <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map((cat) => (
                   <li key={cat.id}>
                     <Link to={`/categories/${cat.id}/books`} className="text-gray-400 hover:text-white">
                       {cat.name}
                     </Link>
                   </li>
                ))}
                <li><Link to="/books" className="text-gray-400 hover:text-white">Lihat Semua</Link></li>
             </ul>
          </div>
          {/* Kolom 4: Hubungi Kami */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-gray-400">
               <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Jl. Merdeka No. 123, Jakarta</li>
               <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +62 123 4567 890</li>
               <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@bookhaven.com</li>
            </ul>
            <div className="flex gap-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 py-6">
            <p className="text-center text-sm text-gray-500">
                &copy; 2024 BookHaven. Hak Cipta Dilindungi.
            </p>
        </div>
      </footer>
    </div>
  );
}