import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Sesuaikan path jika perlu

/**
 * Komponen ini membungkus halaman publik seperti Login.
 * Jika user sudah login, dia akan diarahkan ke halaman yang sesuai (dashboard/home).
 * Jika belum login, dia akan melihat halaman yang dibungkus (misal: LoginPage).
 */
const GuestRoute = ({ element: Component }) => {
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    // Jika sudah login, cek rolenya
    if (user.role === 'admin') {
      // Jika admin, lempar ke dashboard
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // Jika user biasa, lempar ke homepage
      return <Navigate to="/" replace />;
    }
  }

  // Jika belum login, izinkan akses ke halaman (LoginPage)
  return <Component />;
};

export default GuestRoute;