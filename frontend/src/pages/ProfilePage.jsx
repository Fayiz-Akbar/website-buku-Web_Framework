import React, { useState, useEffect } from 'react';
import { Link, NavLink, Routes, Route, useNavigate } from 'react-router-dom';
// PERBAIKAN: Tambahkan ekstensi file
import { useAuth } from '../Context/AuthContext.jsx';
import { apiAuth } from '../api/axios.js'; // Ingat ini .js
import UpdateProfileForm from './Profile/UpdateProfileForm.jsx';
import UpdatePasswordForm from './Profile/UpdatePasswordForm.jsx';
import UserAddressPage from './Profile/UserAddressPage.jsx';
import UserOrderList from './Profile/UserOrderList.jsx';
import UserOrderDetailPage from './Profile/UserOrderDetailPage.jsx'; // <-- Import halaman detail
import { User, Lock, MapPin, ListOrdered, LogOut, Camera } from 'lucide-react';
import defaultAvatar from '../assets/react.svg'; // Asumsi ada avatar default

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || defaultAvatar);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Update avatar preview jika data user berubah (misalnya setelah update)
        setAvatarPreview(user?.avatar_url || defaultAvatar);
    }, [user]);

    const handleLogout = async () => {
        try {
            await apiAuth.post('/logout');
            logout();
            navigate('/'); // Redirect ke homepage setelah logout
        } catch (error) {
            console.error('Logout failed:', error);
            // Tetap logout di frontend meskipun API gagal (misal karena token sudah expired)
            logout();
            navigate('/');
        }
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Tampilkan preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload ke backend
        setIsUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await apiAuth.post('/profile/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Update data user di AuthContext dengan data baru dari backend
            updateUser(response.data.user);
            alert('Foto profil berhasil diperbarui!');
        } catch (error) {
            console.error('Gagal mengupload foto profil:', error);
            alert('Gagal mengupload foto profil. Pastikan file adalah gambar dan ukurannya tidak terlalu besar.');
            // Kembalikan preview ke avatar lama jika upload gagal
            setAvatarPreview(user?.avatar_url || defaultAvatar);
        } finally {
            setIsUploading(false);
        }
    };

    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h1>
            <div className="md:flex md:gap-8">
                {/* Sidebar Navigasi Profil */}
                <aside className="md:w-64 mb-8 md:mb-0 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center mb-6">
                         <div className="relative mb-4 group">
                             <img
                                src={avatarPreview}
                                alt={user?.name || 'User Avatar'}
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow"
                                // Fallback jika URL avatar gagal dimuat
                                onError={(e) => { e.target.src = defaultAvatar; }}
                            />
                            <label htmlFor="avatar-upload" className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100 cursor-not-allowed' : ''}`}>
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <Camera size={20} />
                                )}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={isUploading}
                            />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{user?.name || 'Pengguna'}</h2>
                        <p className="text-sm text-gray-500">{user?.email || 'email@example.com'}</p>
                    </div>

                    <nav className="space-y-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <NavLink to="/profile" end className={getNavLinkClass}>
                            <User size={18} /> Informasi Akun
                        </NavLink>
                        <NavLink to="/profile/password" className={getNavLinkClass}>
                            <Lock size={18} /> Ubah Password
                        </NavLink>
                        <NavLink to="/profile/addresses" className={getNavLinkClass}>
                            <MapPin size={18} /> Alamat Saya
                        </NavLink>
                        <NavLink to="/profile/orders" className={getNavLinkClass} end> {/* Tambah 'end' agar tidak aktif saat di detail */}
                            <ListOrdered size={18} /> Riwayat Pesanan
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </nav>
                </aside>

                {/* Konten Utama Profil */}
                <main className="flex-1 bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    {/* Setup Nested Routes */}
                    <Routes>
                        <Route index element={<UpdateProfileForm />} />
                        <Route path="password" element={<UpdatePasswordForm />} />
                        <Route path="addresses" element={<UserAddressPage />} />
                        <Route path="orders" element={<UserOrderList />} />
                        {/* Rute untuk detail pesanan */}
                        <Route path="orders/:id" element={<UserOrderDetailPage />} />
                         {/* Fallback jika path tidak cocok (opsional) */}
                         {/* <Route path="*" element={<Navigate to="/profile" replace />} /> */}
                    </Routes>
                </main>
            </div>
        </div>
    );
}

