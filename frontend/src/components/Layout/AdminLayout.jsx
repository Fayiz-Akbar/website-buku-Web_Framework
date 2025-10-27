// File: frontend/src/components/Layout/AdminLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx'; 

const AdminLayout = () => {
    return (
        // FIX: Container utama dengan flex dan min-h-screen
        <div className="flex min-h-screen bg-gray-100">
            {/* 1. Sidebar: FIXED di sebelah kiri */}
            <Sidebar /> 
            
            <div className="flex-1 flex flex-col">
                {/* 2. Konten Utama: Gunakan margin kiri yang sama dengan lebar sidebar (w-64) */}
                <main className="flex-1 p-6 ml-64"> 
                    <div className="bg-white p-6 shadow-xl rounded-lg min-h-[calc(100vh-50px)]">
                        <Outlet /> {/* Konten halaman dimuat di sini */}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;