import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// PERBAIKAN: Jalur import ../../../api/axios salah, harusnya ../../api/axios
import { apiAuth } from '../../api/axios'; // Pastikan path import benar
import { Loader2, PackageSearch } from 'lucide-react';

// Helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Helper format tanggal
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
};

// Fungsi untuk mendapatkan style badge berdasarkan status
const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'menunggu_validasi':
            return 'bg-yellow-100 text-yellow-800';
        case 'diproses':
            return 'bg-blue-100 text-blue-800';
        case 'dikirim':
            return 'bg-purple-100 text-purple-800';
        case 'selesai':
            return 'bg-green-100 text-green-800';
        case 'dibatalkan':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Fungsi untuk mengubah format teks status
const formatStatusText = (status) => {
    if (!status) return 'Tidak Diketahui';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Ganti _ jadi spasi, huruf awal jadi kapital
};


export default function UserOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // Panggil endpoint /my-orders yang baru dibuat
                const response = await apiAuth.get('/my-orders');
                setOrders(response.data.data); // Asumsi respons API memiliki { data: [...] }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Gagal memuat riwayat pesanan.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []); // Jalankan hanya sekali saat komponen dimuat

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-6 text-red-600 bg-red-100 rounded-lg">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center gap-4">
                 <PackageSearch className="w-16 h-16 text-gray-400" />
                 <h2 className="text-xl font-semibold">Belum Ada Pesanan</h2>
                 <p>Anda belum melakukan pemesanan buku.</p>
                 <Link to="/books" className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                     Mulai Belanja
                 </Link>
            </div>
        );
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <ul role="list" className="divide-y divide-gray-200">
                {orders.map((order) => (
                    <li key={order.id}>
                        <Link to={`/profile/orders/${order.id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-blue-600 truncate">
                                        Pesanan #{order.id}
                                    </p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(order.status)}`}>
                                            {formatStatusText(order.status)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            {/* Bisa ditambahkan icon kalender jika mau */}
                                            Tanggal Pesan: {formatDate(order.created_at)}
                                        </p>
                                        {/* Bisa tambahkan info lain seperti jumlah item jika ada di API */}
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-900 font-semibold sm:mt-0">
                                        {formatRupiah(order.total_amount)}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Catatan: Pastikan helper functions tidak terduplikasi di akhir file

