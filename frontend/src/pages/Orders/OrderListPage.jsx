// frontend/src/pages/Orders/OrderListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// FIX KRITIS: Ganti axios dengan apiAuth
import { apiAuth } from '../../api/axios'; // Pastikan path ini benar!

const API_ENDPOINT = '/admin/orders';

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const paymentStatusFilter = searchParams.get('payment_status') || 'pending'; 

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };
    
    const fetchOrders = async (status) => {
        setLoading(true);
        setError(null);
        try {
            // FIX KRITIS: Gunakan apiAuth.get()
            const response = await apiAuth.get(API_ENDPOINT, {
                params: { payment_status: status }
            });
            setOrders(response.data.data); // data paginasi
        } catch (err) {
            console.error("Error fetching orders:", err);
            if (err.response && err.response.status >= 400) {
                 setError("Gagal mengambil data pesanan. Pastikan token Admin valid.");
            } else {
                 setError("Gagal mengambil data pesanan. Cek koneksi.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(paymentStatusFilter);
    }, [paymentStatusFilter]);

    const handleFilterChange = (status) => {
        setSearchParams({ payment_status: status });
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Pesanan</h1>
            
            <div className="mb-4 flex space-x-2">
                <button 
                    onClick={() => handleFilterChange('pending')} 
                    className={`py-2 px-4 rounded ${paymentStatusFilter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    Menunggu Konfirmasi
                </button>
                <button 
                    onClick={() => handleFilterChange('success')} 
                    className={`py-2 px-4 rounded ${paymentStatusFilter === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                    Berhasil
                </button>
                <button 
                    onClick={() => handleFilterChange('failed')} 
                    className={`py-2 px-4 rounded ${paymentStatusFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                    Ditolak/Batal
                </button>
            </div>

            <table className="min-w-full bg-white border shadow rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-4 text-left">Order Code</th>
                        <th className="py-3 px-4 text-left">Pelanggan</th>
                        <th className="py-3 px-4 text-left">Total</th>
                        <th className="py-3 px-4 text-left">Status Order</th>
                        <th className="py-3 px-4 text-left">Status Bayar</th>
                        <th className="py-3 px-4 text-left">Tanggal</th>
                        <th className="py-3 px-4 text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {orders.length > 0 ? orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono">{order.order_code}</td>
                            <td className="py-3 px-4">{order.user?.name || 'N/A'}</td>
                            <td className="py-3 px-4">{formatRupiah(order.total_amount)}</td>
                            <td className="py-3 px-4">{order.status}</td>
                            <td className="py-3 px-4">{order.payment?.status || 'N/A'}</td>
                            <td className="py-3 px-4">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                            <td className="py-3 px-4">
                                <Link 
                                    to={`/admin/orders/${order.id}`} 
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                >
                                    Detail
                                </Link>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="7" className="text-center py-4">Tidak ada pesanan dengan status "{paymentStatusFilter}".</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}