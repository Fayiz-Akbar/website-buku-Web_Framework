// frontend/src/components/Layout/AdminLayout.jsx

import React from 'react';
import Sidebar from './Sidebar'; // Asumsi Anda punya Sidebar
import Navbar from './Navbar';   // Asumsi Anda punya Navbar
import { Outlet } from 'react-router-dom'; // <-- 1. IMPORT OUTLET

const AdminLayout = () => {
  console.log("AdminLayout is rendering!");
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar /> {/* Komponen Sidebar Anda */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar /> {/* Komponen Navbar Atas Anda */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {/* --- 2. LETAKKAN OUTLET DI SINI --- */}
          <Outlet /> 
          {/* Outlet adalah tempat halaman (DashboardPage, BookListPage, dll.) akan dirender */}
          {/* ---------------------------------- */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;