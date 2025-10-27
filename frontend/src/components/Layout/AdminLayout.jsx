// File: frontend/src/components/Layout/AdminLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx'; 

const AdminLayout = () => {
    return (
        // FIX: Container utama dengan flex
        <div className="flex min-h-screen bg-gray-100">
            {/* 1. Sidebar: FIXED dan diletakkan di luar flex-1 */}
            <Sidebar /> 
            
            <div className="flex-1 flex flex-col">
                {/* 2. Konten Utama: ml-64 membuat ruang untuk sidebar */}
                <main className="flex-1 p-6 ml-64"> 
                    <div className="bg-white p-6 shadow-xl rounded-lg min-h-[calc(100vh-50px)]">
                        <Outlet /> 
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;