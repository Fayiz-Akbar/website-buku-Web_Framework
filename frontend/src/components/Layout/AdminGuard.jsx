// File: frontend/src/components/Layout/AdminGuard.jsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// PERBAIKAN: Hapus ekstensi .jsx agar sesuai dengan App.jsx
import { useAuth } from '../../Context/AuthContext'; 

export const AdminGuard = ({ children }) => {
    const { user, isLoggedIn, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Tampilkan loading indicator jika status auth masih loading
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Jika sudah login DAN role adalah 'admin', izinkan akses
    if (isLoggedIn && user?.role === 'admin') {
        // Jika children diberikan (seperti <AdminGuard><AdminLayout /></AdminGuard>), render children
        // Jika tidak (seperti <Route element={<AdminGuard><Dashboard /></AdminGuard>}), render Outlet
        return children ? children : <Outlet />;
    }

    // Jika tidak login, redirect ke halaman login
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Jika login tapi BUKAN admin, redirect ke halaman utama atau halaman 'unauthorized'
    // Untuk saat ini, kita redirect ke halaman utama
    return <Navigate to="/" replace />;
};

// Export sebagai named export
export default AdminGuard; // Anda bisa memilih export default atau named

