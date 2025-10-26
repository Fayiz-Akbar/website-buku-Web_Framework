// frontend/src/components/Layout/GuestRoute.jsx

import React from 'react';
// 1. Import Outlet
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Sesuaikan path jika perlu

/**
 * Komponen ini membungkus rute publik seperti Login & Register
 * SEBAGAI LAYOUT ROUTE ELEMENT.
 * Jika user sudah login, dia akan diarahkan.
 * Jika belum login, dia akan me-render <Outlet /> agar child route (LoginPage/RegisterPage) tampil.
 */
const GuestRoute = () => { // Tidak perlu props 'element' lagi
  const { user, isLoggedIn } = useAuth();

  // Tambahkan log untuk debug (opsional)
  // console.log("GuestRoute Layout Check:", { isLoggedIn, userRole: user?.role });

  if (isLoggedIn) {
    // console.log("GuestRoute Layout: User logged in, redirecting...");
    // Jika sudah login, redirect berdasarkan role
    return user?.role === 'admin'
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/" replace />;
  }

  // Jika belum login, render child route melalui Outlet
  // console.log("GuestRoute Layout: User not logged in, rendering Outlet.");
  return <Outlet />; // <-- 2. Render Outlet, bukan <Component />
};

export default GuestRoute;