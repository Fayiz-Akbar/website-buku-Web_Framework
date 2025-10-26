import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate
// --- Tambahkan Heart dan LogOut ---
import { ShoppingCart, Search, Menu, X, User, MapPin, Phone, Mail, ChevronDown, Heart, LogOut } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Path sudah benar
// Hapus import useCart jika tidak digunakan di sini (sudah dihapus sesuai instruksi)
// import { useCart } from '../../Context/CartContext'; 

export default function UserLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const { user, logout, isLoggedIn } = useAuth(); // Ambil user, logout, isLoggedIn
    const navigate = useNavigate(); // Hook untuk navigasi

    // Ambil Kategori untuk Navigasi
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/categories');
                setCategories(response.data.data || response.data);
            } catch (error) {
                console.error("Gagal mengambil kategori:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login'); // Arahkan ke login setelah logout
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 text-white text-xs">
                {/* ... (kode top bar tetap sama) ... */}
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
                        <Link to="/" className="flex items-center">
                            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">BOOKSTORE</h1>
                        </Link>

                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            {/* ... (kode search bar tetap sama) ... */}
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

                        {/* Right Icons */}
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            {/* --- Tombol Akun/Login --- */}
                             {isLoggedIn ? (
                                <div className="relative group hidden md:flex">
                                    <button className="flex flex-col items-center text-gray-700 hover:text-blue-600">
                                        <User className="w-6 h-6" />
                                        <span className="text-xs mt-1">{user?.full_name?.split(' ')[0] || 'Akun'}</span>
                                    </button>
                                     {/* Dropdown Logout */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-50">
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil Saya</Link>
                                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pesanan Saya</Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4"/> Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="hidden md:flex flex-col items-center text-gray-700 hover:text-blue-600">
                                    <User className="w-6 h-6" />
                                    <span className="text-xs mt-1">Login</span>
                                </Link>
                            )}
                            
                            {/* --- Tombol Favorit BARU --- */}
                            <Link to="/wishlist" className="flex flex-col items-center text-gray-700 hover:text-blue-600 relative">
                                <Heart className="w-6 h-6" />
                                <span className="text-xs mt-1">Favorit</span>
                                {/* Opsional: Tambahkan counter jika WishlistContext menyediakan */}
                                {/* {wishlistCount > 0 && (...) } */}
                            </Link>
                            
                            {/* Tombol Keranjang (tidak ada counter lagi) */}
                            <button className="relative flex flex-col items-center text-gray-700 hover:text-blue-600" onClick={() => alert('Fitur keranjang sedang dikerjakan oleh tim lain :)')}>
                                <ShoppingCart className="w-6 h-6" />
                                <span className="text-xs mt-1">Keranjang</span>
                                {/* Angka dihapus */}
                            </button>

                            {/* Tombol Menu Mobile */}
                            <button
                                className="md:hidden text-gray-700"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden pb-3">
                         {/* ... (kode search bar mobile tetap sama) ... */}
                        <div className="relative">
                            <input
                            type="text"
                            placeholder="Cari buku..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                            <button className="absolute right-0 top-0 h-full px-4 bg-blue-600 text-white rounded-r-md">
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                 {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white absolute w-full z-40 shadow-md">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {isLoggedIn ? (
                                <>
                                    <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Profil Saya</Link>
                                    <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Pesanan Saya</Link>
                                     <button 
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login / Daftar</Link>
                            )}
                            {/* Tambahkan link lain jika perlu */}
                        </div>
                    </div>
                )}
            </header>

            {/* Navigation Categories */}
            <nav className="bg-gray-100 border-b">
                 {/* ... (kode navigasi kategori tetap sama) ... */}
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="hidden md:flex items-center justify-center space-x-6 py-3 text-sm overflow-x-auto">
                        {categories.map((category) => (
                        <Link // Gunakan Link
                            key={category.id}
                            to={`/category/${category.id}`} // Arahkan ke halaman kategori
                            className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap px-2 py-1"
                        >
                            {category.name}
                        </Link>
                        ))}
                    </div>
                     {/* Mobile Category Dropdown */}
                    <div className="md:hidden py-3">
                        <button className="flex items-center justify-between w-full text-gray-700 bg-white px-4 py-2 border rounded-md shadow-sm">
                            <span className="font-medium">Semua Kategori</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                         {/* TODO: Implement dropdown logic for mobile categories */}
                    </div>
                </div>
            </nav>

            {/* Konten Halaman (Ini akan dirender oleh <Outlet />) */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 mt-12">
                 {/* ... (kode footer tetap sama) ... */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
                        {/* Kolom Footer */}
                        <div>
                            <h4 className="font-bold text-white mb-4 text-base">TENTANG KAMI</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white">Tentang Bookstore</a></li>
                                <li><a href="#" className="hover:text-white">Karir</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-white mb-4 text-base">LAYANAN</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white">Cara Berbelanja</a></li>
                                <li><a href="#" className="hover:text-white">Lacak Pesanan</a></li>
                                <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
                                <li><a href="#" className="hover:text-white">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 text-base">HUBUNGI KAMI</h4>
                            <ul className="space-y-2">
                                <li>Telp: 0804-1-500-800</li>
                                <li>Email: cs@bookstore.com</li>
                                <li>Senin - Jumat: 08.00 - 17.00</li>
                                <li>Sabtu: 08.00 - 13.00</li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold text-white mb-4 text-base">IKUTI KAMI</h4>
                            <div className="flex space-x-3 mb-4">
                                {/* TODO: Replace with actual icons */}
                                <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-blue-600 flex items-center justify-center text-white rounded">f</a>
                                <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-blue-600 flex items-center justify-center text-white rounded">X</a>
                                <a href="#" className="w-8 h-8 bg-gray-700 hover:bg-blue-600 flex items-center justify-center text-white rounded">IG</a>
                            </div>
                            <h5 className="font-semibold text-white mb-2">METODE PEMBAYARAN</h5>
                            {/* TODO: Replace with actual payment logos */}
                             <div className="flex flex-wrap gap-2">
                                <span className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">VISA</span>
                                <span className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">BCA</span>
                                <span className="bg-white px-2 py-1 text-xs text-gray-800 font-semibold rounded">OVO</span>
                            </div>
                        </div>
                    </div>
                     <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs">
                        <p>© 2025 BOOKSTORE. Hak Cipta Dilindungi</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

