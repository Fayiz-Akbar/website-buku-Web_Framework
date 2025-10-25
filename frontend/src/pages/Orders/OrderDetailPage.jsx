// frontend/src/pages/Orders/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/orders';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrderDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            setOrder(response.data.data); // Data ada di .data
        } catch (err) {
            console.error("Error fetching order detail:", err);
            setError("Gagal mengambil detail pesanan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);
    
    const handleAction = async (action) => {
        let url = `${API_URL}/${id}/${action}`;
        let payload = {};
        
        if (action === 'reject') {
            const reason = prompt("Masukkan alasan penolakan (wajib diisi):");
            if (!reason) {
                alert("Aksi dibatalkan. Alasan wajib diisi.");
                return;
            }
            payload = { reason };
        }
        
        try {
            await axios.post(url, payload);
            alert(`Pesanan berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}.`);
            fetchOrderDetail();
        } catch (err) {
            console.error(`Error ${action} order:`, err);
            alert(`Gagal memproses pesanan: ${err.response?.data?.message || ''}`);
        }
    };

    if (loading) return <div className="p-4">Loading detail...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!order) return <div className="p-4">Data pesanan tidak ditemukan.</div>;

    const { user, address, payment, items } = order;
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Detail Pesanan: {order.order_code}</h1>
            
            {payment?.status === 'pending' && (
                <div className="mb-4 p-4 bg-yellow-100 rounded border border-yellow-300">
                    <h2 className="text-lg font-semibold mb-2">Aksi Admin</h2>
                    <p className="mb-2">Pesanan ini menunggu konfirmasi Anda.</p>
                    <button 
                        onClick={() => handleAction('approve')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                        Setujui Pembayaran
                    </button>
                    <button 
                        onClick={() => handleAction('reject')}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Tolak Pembayaran
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="md:col-span-1 bg-white p-4 shadow rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Pembayaran</h3>
                    <p>Status: <span className="font-bold">{payment?.status || 'N/A'}</span></p>
                    <p>Metode: {payment?.payment_method || 'N/A'}</p>
                    <p>Total Tagihan: Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</p>
                    {payment?.admin_notes && <p className="text-sm text-red-500 mt-2">Catatan Admin: {payment.admin_notes}</p>}
                    
                    {payment?.proof_image_url ? (
                        <div className="mt-4">
                            <h4 className="font-semibold">Bukti Transfer:</h4>
                            <a href={payment.proof_image_url} target="_blank" rel="noopener noreferrer" title="Klik untuk perbesar">
                                <img src={payment.proof_image_url} alt="Bukti Transfer" className="w-full h-auto rounded border mt-2" />
                            </a>
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-500">Pelanggan belum meng-upload bukti transfer.</p>
                    )}
                </div>
                
                <div className="md:col-span-1 bg-white p-4 shadow rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Pelanggan</h3>
                    <p>{user?.name}</p>
                    <p>{user?.email}</p>
                    
                    <h3 className="text-xl font-semibold mb-2 mt-4">Alamat Pengiriman</h3>
                    {address ? (
                        <>
                            <p className="font-bold">{address.recipient_name} ({address.label})</p>
                            <p>{address.recipient_phone}</p>
                            <p>{address.full_address}</p>
                            <p>{address.city}, {address.postal_code}</p>
                        </>
                    ) : <p>Data alamat tidak ada.</p>}
                </div>
                
                <div className="md:col-span-1 bg-white p-4 shadow rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Item Pesanan ({items?.length || 0})</h3>
                    {items?.map(item => (
                        <div key={item.id} className="mb-2 pb-2 border-b last:border-b-0">
                            <p className="font-bold">{item.snapshot_book_title}</p>
                            <p className="text-sm">{item.quantity} x Rp {new Intl.NumberFormat('id-ID').format(item.snapshot_price_per_item)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}