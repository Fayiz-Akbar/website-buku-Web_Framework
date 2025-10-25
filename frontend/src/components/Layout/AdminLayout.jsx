// frontend/src/components/Layout/AdminLayout.jsx

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto mt-16 ml-64 p-6">
          {/* Konten Halaman akan di-render di sini */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;