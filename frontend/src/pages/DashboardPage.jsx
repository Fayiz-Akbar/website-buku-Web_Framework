// File: frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, BookOpen, Users, Clock, Loader2, AlertCircle } from 'lucide-react';
// FIX JALUR: Pastikan path ini benar untuk file yang berada di /src/pages/
import { apiAuth } from '../api/axios'; 
import api from '../api/axios';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

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


export default function DashboardPage(props) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
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

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                // asumsi baseURL sudah mengarah ke /api
                const res = await api.get('/admin/orders', { params: { per_page: 200 } });
                const items = res?.data?.data ?? res?.data ?? [];
                if (!cancelled) setOrders(Array.isArray(items) ? items : []);
            } catch (e) {
                if (!cancelled) setError(e?.response?.data?.message || e.message || 'Gagal memuat data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    const fmtDate = (d) => (new Date(d)).toISOString().slice(0,10);
    const lastNDays = (n) => {
        const out = [];
        const today = new Date();
        for (let i = n - 1; i >= 0; i--) {
            const dt = new Date(today);
            dt.setDate(today.getDate() - i);
            out.push(dt.toISOString().slice(0,10));
        }
        return out;
    };

    const {
        revenueByDayLabels,
        revenueByDayData,
        statusCounts
    } = useMemo(() => {
        const labels = lastNDays(14);
        const map = Object.fromEntries(labels.map(l => [l, 0]));
        const counts = { pending: 0, paid: 0, failed: 0 };

        for (const o of orders) {
            const payment = o.payment || {};
            const status = (payment.status || o.payment_status || o.status || '').toLowerCase();
            if (status in counts) counts[status]++;

            if (status === 'paid') {
                const paidAt = payment.confirmed_at || o.paid_at || o.updated_at || o.created_at;
                if (paidAt) {
                    const day = fmtDate(paidAt);
                    if (map[day] !== undefined) {
                        const total = Number(o.total ?? o.total_amount ?? o.grand_total ?? o.amount ?? 0);
                        map[day] += isFinite(total) ? total : 0;
                    }
                }
            }
        }

        return {
            revenueByDayLabels: labels,
            revenueByDayData: labels.map(l => map[l]),
            statusCounts: counts
        };
    }, [orders]);

    const revenueLineData = {
        labels: revenueByDayLabels,
        datasets: [
            {
                label: 'Pendapatan (Rp)',
                data: revenueByDayData,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                tension: 0.35,
                fill: true,
                pointRadius: 3
            }
        ]
    };

    const revenueLineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Pendapatan Harian (14 hari terakhir)' },
            tooltip: {
                callbacks: {
                    label: (ctx) => `Rp ${Number(ctx.parsed.y || 0).toLocaleString('id-ID')}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (v) => `Rp ${Number(v).toLocaleString('id-ID')}`
                }
            }
        }
    };

    const statusDoughnutData = {
        labels: ['Pending', 'Paid', 'Failed'],
        datasets: [{
            data: [statusCounts.pending, statusCounts.paid, statusCounts.failed],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444']
        }]
    };

    // ...existing code...
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
        <>
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

            <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 h-96">
                  <Line data={revenueLineData} options={revenueLineOptions} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 h-96 flex flex-col">
                  <h3 className="text-slate-700 font-semibold mb-4">Status Pembayaran</h3>
                  <div className="flex-1">
                    <Doughnut data={statusDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 text-center text-sm">
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{background:'#f59e0b'}}></span>Pending: {statusCounts.pending}</div>
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{background:'#10b981'}}></span>Paid: {statusCounts.paid}</div>
                    <div><span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{background:'#ef4444'}}></span>Failed: {statusCounts.failed}</div>
                  </div>
                </div>
              </section>

              {error && <p className="mt-4 text-sm text-red-600">Gagal memuat grafik: {String(error)}</p>}
              {loading && <p className="mt-4 text-sm text-slate-500">Memuat data...</p>}
        </>
    );
}