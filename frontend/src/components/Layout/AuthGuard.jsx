// frontend/src/components/Layout/AuthGuard.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; // Sesuaikan path jika perlu

/**
 * Komponen ini membungkus rute yang dilindungi.
 * Ia akan memeriksa apakah user adalah admin.
 * Jika ya, ia akan me-render 'children' (yaitu AdminLayout + Halaman).
 * Jika tidak, ia akan mengarahkan (redirect) ke /login.
 */
const AuthGuard = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  console.log("AuthGuard Check:", { isLoggedIn, userRole: user?.role });

  if (!isLoggedIn) {
    // 1. Jika belum login, lempar ke /login
    // 'replace' berarti halaman ini tidak akan masuk ke history browser
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // 2. Jika sudah login TAPI BUKAN admin, lempar ke homepage
    return <Navigate to="/" replace />;
  }
  console.log("AuthGuard: Rendering children...");

  // 3. Jika sudah login DAN adalah admin, tampilkan halaman (children)
  return <>{children}</>;
};

export default AuthGuard; // <-- Menggunakan export default