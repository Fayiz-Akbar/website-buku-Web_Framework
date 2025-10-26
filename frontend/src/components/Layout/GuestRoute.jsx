// File: frontend/src/components/Layout/GuestRoute.jsx

import React from 'react';
// [PERBAIKAN] Import Outlet
import { Navigate, Outlet } from 'react-router-dom'; 
import { useAuth } from '../../Context/AuthContext'; 

/**
 * Komponen ini membungkus halaman publik seperti Login dan Register.
 * Jika user sudah login, dia akan diarahkan ke halaman yang sesuai.
 * Jika belum, ia merender halaman anak (Outlet).
 */
// [PERBAIKAN] Hapus prop 'element'
const GuestRoute = () => { 
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    // Jika sudah login, cek rolenya
    if (user?.role === 'admin') { 
      // Konsisten dengan App.jsx: /dashboard
      return <Navigate to="/dashboard" replace />;
    } else {
      // Jika user biasa, lempar ke homepage
      return <Navigate to="/" replace />;
    }
  }

  // [PERBAIKAN] Jika belum login, izinkan akses ke halaman anak
  return <Outlet />; 
};

export default GuestRoute;