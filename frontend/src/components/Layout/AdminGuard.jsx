// File: frontend/src/components/Layout/AdminGuard.jsx (Contoh Perbaikan)

import React from 'react';
// FIX: Pastikan useNavigate di-import
import { Navigate, Outlet, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../Context/AuthContext.jsx'; // Sesuaikan path

// Gunakan named export jika AdminGuard diexport sebagai const
export const AdminGuard = ({ children }) => {
    const { user, isLoggedIn } = useAuth();
    // FIX: Gunakan hook useNavigate di dalam fungsi komponen
    const navigate = useNavigate(); 

    if (!isLoggedIn) {
        // Ini seharusnya sudah di-handle oleh AuthGuard
        return <Navigate to="/login" replace />; 
    }

    if (user && user.role !== 'admin') {
        // Redirect non-admin ke homepage
        // FIX: Gunakan navigate yang sudah dideklarasikan
        return <Navigate to="/" replace />; 
    }

    // Jika user adalah admin, tampilkan children
    return children ? children : <Outlet />;
};

// Jika AdminGuard diexport default, gunakan ini
// export default AdminGuard;