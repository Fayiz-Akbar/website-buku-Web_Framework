import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// FIX KRITIS: Tambahkan ekstensi file pada impor axios.js
import { apiAuth } from '../../api/axios.js'; 
import { Loader2, CheckCircle, XCircle } from 'lucide-react'; // Tambah icon

const API_ENDPOINT = '/admin/orders';

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchParams, setSearchParams] = useSearchParams();
    // Default filter: pending
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

    if (loading) return <div className="p-4 flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

    // Menentukan apakah filter 'pending' aktif
    const isPendingFilter = paymentStatusFilter === 'pending';
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Pesanan</h1>
            
            {/* Tombol Filter */}
            <div className="mb-6 flex space-x-3 p-2 bg-gray-100 rounded-lg">
                <button 
                    onClick={() => handleFilterChange('pending')} 
                    className={`py-2 px-4 rounded-lg font-semibold transition-colors ${isPendingFilter ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                    Menunggu Konfirmasi
                </button>
                <button 
                    onClick={() => handleFilterChange('success')} 
                    className={`py-2 px-4 rounded-lg font-semibold transition-colors ${paymentStatusFilter === 'success' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                    Berhasil
                </button>
                <button 
                    onClick={() => handleFilterChange('failed')} 
                    className={`py-2 px-4 rounded-lg font-semibold transition-colors ${paymentStatusFilter === 'failed' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                    Ditolak/Batal
                </button>
            </div>

            <table className="min-w-full bg-white border shadow-lg rounded-xl overflow-hidden">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Order Code</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Pelanggan</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Total</th>
                        {/* Kolom Bukti Bayar BARU */}
                        {isPendingFilter && <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Bukti Bayar</th>}
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Status Order</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Status Bayar</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Tanggal</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {orders.length > 0 ? orders.map((order) => (
                        <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-sm">{order.order_code}</td>
                            <td className="py-3 px-4 text-sm">{order.user?.name || 'N/A'}</td>
                            <td className="py-3 px-4 font-semibold text-sm">{formatRupiah(order.total_amount)}</td>
                            
                            {/* Kolom Bukti Bayar Konten BARU */}
                            {isPendingFilter && (
                                <td className="py-3 px-4 text-sm">
                                    {order.payment?.proof_of_payment_url ? (
                                        <span className="text-green-600 flex items-center gap-1 font-medium">
                                            <CheckCircle className="w-4 h-4" /> Diunggah
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1">
                                            <XCircle className="w-4 h-4" /> Belum
                                        </span>
                                    )}
                                </td>
                            )}
                            
                            <td className="py-3 px-4 text-sm">{order.status}</td>
                            <td className="py-3 px-4 text-sm">{order.payment?.status || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                            <td className="py-3 px-4">
                                <Link 
                                    to={`/admin/orders/${order.id}`} 
                                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Detail
                                </Link>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={isPendingFilter ? "8" : "7"} className="text-center py-8 text-gray-500">Tidak ada pesanan dengan status "{paymentStatusFilter}".</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
