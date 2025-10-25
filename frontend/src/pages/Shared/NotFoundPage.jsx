// frontend/src/pages/Shared/NotFoundPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-9xl font-extrabold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold text-gray-600 mt-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 mt-2">Maaf, kami tidak dapat menemukan halaman yang Anda cari.</p>
      <Link 
        to="/admin/dashboard" 
        className="mt-6 text-blue-500 hover:underline font-medium"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
