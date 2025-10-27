// File: frontend/src/components/Layout/GuestRoute.jsx (Contoh Perbaikan)

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx'; // Sesuaikan path

export default function GuestRoute() {
    const { isLoggedIn, user } = useAuth(); // Ambil user object

    if (isLoggedIn) {
        // PERBAIKAN KRITIS: Cek role user
        if (user && user.role === 'admin') {
            // Jika Admin, redirect ke Admin Dashboard
            return <Navigate to="/admin/dashboard" replace />;
        }
        // Jika User biasa, redirect ke homepage
        return <Navigate to="/" replace />;
    }

    // Jika belum login, tampilkan rute anak (misal: LoginPage, RegisterPage)
    return <Outlet />;
}