// frontend/src/components/Layout/AuthGuard.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const AuthGuard = () => {
  const { isLoggedIn } = useAuth();

  // Jika belum login → redirect ke /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login → izinkan akses
  return <Outlet />;
};

export default AuthGuard;
