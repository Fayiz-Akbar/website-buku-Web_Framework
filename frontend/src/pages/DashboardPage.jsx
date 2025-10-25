// frontend/src/pages/DashboardPage.jsx

import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Selamat Datang di Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Buku */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600">Total Buku</h2>
          <p className="text-4xl font-bold text-blue-500 mt-2">125</p>
          <span className="text-sm text-gray-400">di semua kategori</span>
        </div>

        {/* Card 2: Pesanan Baru */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600">Pesanan Baru (Hari Ini)</h2>
          <p className="text-4xl font-bold text-yellow-500 mt-2">7</p>
          <span className="text-sm text-gray-400">Menunggu konfirmasi</span>
        </div>

        {/* Card 3: Total Penjualan */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-600">Total Penjualan (Bulan Ini)</h2>
          <p className="text-4xl font-bold text-green-500 mt-2">Rp 15.4 Juta</p>
          <span className="text-sm text-gray-400">Peningkatan 5%</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
