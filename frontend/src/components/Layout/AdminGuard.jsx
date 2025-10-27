// File: frontend/src/components/Layout/AdminGuard.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; 
import { useAuth } from '../../Context/AuthContext.jsx'; // Sesuaikan path

// Hapus { children } dari props, karena kita akan gunakan <Outlet />
export const AdminGuard = () => {
    const { user, isLoggedIn } = useAuth();

    // Cek ini bisa jadi tidak perlu jika AdminGuard selalu di dalam AuthGuard,
    // tapi lebih aman jika ada.
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; 
    }

    // Jika user ada TAPI bukan admin, tendang ke halaman utama
    if (user && user.role !== 'admin') {
        return <Navigate to="/" replace />; 
    }

    // Jika user adalah admin, izinkan akses ke rute anak (halaman admin)
    return <Outlet />;
};

// export default AdminGuard; // Hapus jika Anda menggunakan named export