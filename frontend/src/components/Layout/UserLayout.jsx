import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import axios from 'axios';

// Komponen ini adalah "Shell" untuk semua halaman user
export default function UserLayout() {
  const [cartCount, setCartCount] = useState(0); // Nanti ini dari CartContext
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Ambil kategori untuk Nav Bar
  useEffect(() => {
    axios.get('http://localhost:8000/api/categories') // Asumsi endpoint ini sudah publik
      .then(response => {
        setCategories(response.data.data || response.data);
      })
      .catch(error => {
        console.error("Gagal mengambil kategori:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center">
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
      </div>

      {/* Main Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold text-blue-700">
                BOOKSTORE
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari judul buku, penulis, atau ISBN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:border-blue-600 focus:outline-none"
                />
                <button className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link to="/profile" className="hidden md:flex flex-col items-center text-gray-700 hover:text-blue-600">
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Akun</span>
              </Link>
              <Link to="/cart" className="relative flex flex-col items-center text-gray-700 hover:text-blue-600">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs mt-1">Keranjang</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari buku..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none"
              />
              <button className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-md">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Categories */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Category Nav */}
          <div className="hidden md:flex items-center justify-center space-x-6 py-3 text-sm overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>
          {/* Mobile Category Nav (Dropdown) */}
          <div className="md:hidden py-3">
            <button className="flex items-center justify-between w-full text-gray-700">
              <span className="font-medium">Semua Kategori</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Konten Halaman (HomePage, DetailPage, dll) akan dirender di sini */}
      <main className="flex-grow">
        <Outlet /> 
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            {/* Kolom 1 */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">TENTANG KAMI</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Tentang Bookstore</a></li>
                <li><a href="#" className="hover:text-white">Karir</a></li>
                <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
              </ul>
            </div>
            {/* Kolom 2 */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">LAYANAN</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Cara Berbelanja</a></li>
                <li><a href="#" className="hover:text-white">Lacak Pesanan</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            {/* Kolom 3 */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">HUBUNGI KAMI</h4>
              <ul className="space-y-2">
                <li>Telp: 0804-1-500-800</li>
                <li>Email: cs@bookstore.com</li>
                <li>Senin - Jumat: 08.00 - 17.00</li>
              </ul>
            </div>
            {/* Kolom 4 */}
            <div>
              <h4 className="font-bold text-white mb-4 text-base">IKUTI KAMI</h4>
              {/* Sosmed icons, dll */}
              <div className="mt-4">
                <h5 className="font-semibold text-white mb-2">METODE PEMBAYARAN</h5>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">VISA</div>
                  <div className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">BCA</div>
                  <div className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">OVO</div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs">
            <p>© 2024 BOOKSTORE. Hak Cipta Dilindungi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
