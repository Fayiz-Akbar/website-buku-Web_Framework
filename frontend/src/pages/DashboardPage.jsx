// File: frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { ShoppingBag, BookOpen, Users, Clock, Loader2, AlertCircle } from 'lucide-react';
// FIX JALUR: Pastikan path ini benar untuk file yang berada di /src/pages/
import { apiAuth } from '../api/axios'; 

// Endpoint untuk mengambil data statistik Dashboard
const API_ENDPOINT = '/admin/stats'; 

// Komponen Card Statistik
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-6 bg-white rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <Icon className={`w-8 h-8 opacity-50`} />
        </div>
    </div>
);

// Helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};


export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            // FIX KRITIS: Gunakan apiAuth untuk otorisasi Admin
            const response = await apiAuth.get(API_ENDPOINT);
            setStats(response.data); // Asumsi backend mengirim objek statistik
        } catch (err) {
            console.error("Error fetching dashboard stats:", err);
            // Error 404/500 terjadi di sini.
            setError("Gagal memuat data dashboard. Pastikan Admin API /admin/stats berfungsi dan terotorisasi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // ... (sisa kode JSX)
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
            </div>
        );
    }

    // Data statistik placeholder jika API belum dibuat atau gagal
    const dashboardStats = stats || {
        total_sales: 1540000,
        books_count: 55,
        new_orders_pending: 3,
        total_users: 120,
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-2">Dashboard Utama</h1>

            {/* Bagian 1: Kartu Statistik Penjualan & Stok */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Penjualan" 
                    value={formatRupiah(dashboardStats.total_sales)} 
                    icon={ShoppingBag} 
                    color="border-blue-500"
                />
                <StatCard 
                    title="Total Buku" 
                    value={dashboardStats.books_count} 
                    icon={BookOpen} 
                    color="border-green-500"
                />
                <StatCard 
                    title="Pesanan Baru (Validasi)" 
                    value={dashboardStats.new_orders_pending} 
                    icon={Clock} 
                    color="border-yellow-500"
                />
                <StatCard 
                    title="Total Pengguna" 
                    value={dashboardStats.total_users} 
                    icon={Users} 
                    color="border-purple-500"
                />
            </div>

            {/* Bagian 2: Grafik Penjualan (Placeholder) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">Grafik Penjualan Bulanan</h2>
                    <div className="text-center h-64 flex items-center justify-center text-gray-500">
                        Placeholder untuk Chart Penjualan (Membutuhkan library Chart.js/Recharts)
                    </div>
                </div>

                {/* Bagian 3: Ringkasan Terbaru (Placeholder) */}
                 <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">Aktivitas Terbaru</h2>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li>[10:30] Pesanan ORD-12347 masuk (Menunggu Validasi)</li>
                        <li>[09:45] Buku 'React Lanjutan' ditambahkan oleh Admin</li>
                        <li>[08:00] Admin 'Fayiz' berhasil login</li>
                        <li>[07:30] Total penjualan bulan ini mencapai target</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}