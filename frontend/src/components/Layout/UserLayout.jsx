import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";

export default function UserLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ===== TOP BAR ===== */}
      <div className="bg-gray-800 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              0804-1-500-800
            </span>
            <span className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              cs@bookstore.com
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center cursor-pointer hover:text-gray-300">
              <MapPin className="w-3 h-3 mr-1" />
              Lokasi Toko
            </span>
            <span className="cursor-pointer hover:text-gray-300">Bantuan</span>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
              BOOKSTORE
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Cari judul buku, penulis..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ikon kanan */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {isLoggedIn ? (
              <div className="relative hidden md:flex flex-col items-center text-gray-700">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex flex-col items-center hover:text-blue-600 focus:outline-none"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs mt-1">
                    {user?.full_name?.split(" ")[0] || "Akun"}
                  </span>
                </button>

                {/* Dropdown akun */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-md shadow-lg z-50">
                    <button
                      onClick={() => handleNavigate("/profile")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profil Saya
                    </button>
                    <button
                      onClick={() => handleNavigate("/profile/orders")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Pesanan Saya
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex flex-col items-center text-gray-700 hover:text-blue-600"
              >
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Login</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex flex-col items-center text-gray-700 hover:text-blue-600"
            >
              <Heart className="w-6 h-6" />
              <span className="text-xs mt-1">Favorit</span>
            </Link>

            {/* Keranjang */}
            <button
              onClick={() => alert("Fitur keranjang sedang dikembangkan")}
              className="flex flex-col items-center text-gray-700 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs mt-1">Keranjang</span>
            </button>

            {/* Menu Mobile */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== NAV KATEGORI ===== */}
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center justify-center space-x-6 py-3 text-sm overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap px-2 py-1"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== KONTEN UTAMA ===== */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Tentang Kami */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tentang Kami</h3>
            <p className="text-sm leading-relaxed">
              BookStore adalah toko buku online terpercaya yang menyediakan berbagai
              macam buku, mulai dari fiksi, nonfiksi, pendidikan, hingga pengembangan diri.
            </p>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-white">Hubungi Kami</Link></li>
              <li><Link to="/shipping" className="hover:text-white">Pengiriman</Link></li>
              <li><Link to="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kontak</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> 0804-1-500-800</li>
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> cs@bookstore.com</li>
              <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Jl. Sudirman No. 12, Jakarta</li>
            </ul>
          </div>

          {/* Sosial Media */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
          © {new Date().getFullYear()} BookStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
