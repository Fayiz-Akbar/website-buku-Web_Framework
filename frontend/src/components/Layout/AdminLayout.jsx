// File: frontend/src/components/Layout/AdminLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx'; 

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar (drawer di mobile, fixed di desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop untuk mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Area konten */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* Topbar ringan */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <button
              className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-semibold text-slate-800">Admin Toko Buku</div>
            <div className="w-9 h-9" />
          </div>
        </header>

        {/* Konten halaman */}
        <main className="flex-1 p-4 sm:p-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;