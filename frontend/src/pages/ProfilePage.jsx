import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// MEMPERBAIKI JALUR IMPORT DARI components/Profile KE pages/Profile
import UpdateProfileForm from './Profile/UpdateProfileForm'; 
import UpdatePasswordForm from './Profile/UpdatePasswordForm';
import UserOrderList from './Profile/UserOrderList';
import UserAddressPage from './Profile/UserAddressPage';

// Fungsi untuk mendapatkan komponen yang akan dirender berdasarkan path
const getProfileComponent = (pathname) => {
    // Menghapus '/profile' dari path
    const subpath = pathname.replace('/profile', ''); 

    switch (subpath) {
        case '/password':
            // Menggunakan komponen form ubah password
            return <UpdatePasswordForm />;
        case '/addresses':
            // Kelola alamat pengiriman
            return <UserAddressPage />;
        case '/orders':
            // Menggunakan komponen daftar pesanan
            return <UserOrderList />;
        case '': // Path default: /profile (Data Diri)
        default:
            // Menggunakan komponen form update profile
            return <UpdateProfileForm />; 
    }
};

export default function ProfilePage() {
    const location = useLocation();
    const currentPath = location.pathname;

    // Data untuk Sidebar Navigasi
    const navItems = [
        { path: "/profile", name: "Data Diri" },
        { path: "/profile/password", name: "Ubah Password" },
        { path: "/profile/addresses", name: "Alamat Pengiriman" },
        { path: "/profile/orders", name: "Riwayat Pesanan" },
    ];

    return (
        <div className="bg-gray-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                    Pengaturan Akun
                </h1>
                
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigasi */}
                    <aside className="w-full lg:w-64">
                        <nav className="p-4 bg-white rounded-xl shadow-lg border">
                            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Menu Saya</h2>
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.path}>
                                        <Link 
                                            to={item.path}
                                            className={`block p-3 rounded-lg transition duration-150 ease-in-out 
                                                ${currentPath === item.path 
                                                    ? 'bg-blue-600 text-white font-semibold shadow-md' 
                                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Konten Utama (Form/List yang dipilih) */}
                    <section className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg border p-6 md:p-8">
                            {getProfileComponent(currentPath)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
