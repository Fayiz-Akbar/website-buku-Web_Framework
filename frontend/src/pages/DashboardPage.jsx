// File: frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { apiAuth } from '../api/axios';
// (1) Import gambar QRIS Anda
import QrisImage from '../assets/qris_payment.jpg'; // <-- PERBAIKAN

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, loading: loadingCart, processCheckout, fetchCart } = useCart();
    
    // (2) Ambil 'state' dari navigasi
    const location = useLocation();
    const itemIdsToCheckout = location.state?.items || [];

    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);
    
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // (3) Hitung item dan total HANYA berdasarkan item yang dipilih
    const { itemsToCheckout, totalAmount } = useMemo(() => {
        const items = cartItems.filter(item => itemIdsToCheckout.includes(item.id));
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { itemsToCheckout: items, totalAmount: total };
    }, [cartItems, itemIdsToCheckout]);

    // Effect untuk memuat Alamat User
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return; 
            try {
                const response = await apiAuth.get('/user/addresses'); 
                const addresses = response.data.data;
                setUserAddresses(addresses);
                
                const primary = addresses.find(addr => addr.is_primary) || (addresses.length > 0 ? addresses[0] : null);
                if (primary) {
                    setSelectedAddressId(primary.id);
                }
            } catch (err) {
                console.error("Gagal memuat alamat:", err);
                setError("Gagal memuat alamat pengiriman.");
            } finally {
                setLoadingAddresses(false);
            }
        };
        
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    // (4) Redirect jika tidak ada item dipilih (ini adalah error Anda)
    if (!loadingCart && itemsToCheckout.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center mt-12">
                <p className="text-xl text-red-600 font-semibold">Tidak ada item yang dipilih untuk dicheckout.</p>
                <div className="mt-4 space-x-4">
                    <Link to="/cart" className="text-blue-600 hover:underline">
                        ← Kembali ke Keranjang
                    </Link>
                    <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Ayo belanja
                    </Link>
                </div>
            </div>
        );
    }
    
    // Tampilan Loading
    if (loadingCart || loadingAddresses || !user) {
        return <div className="container mx-auto p-4 text-center mt-12">Memuat Checkout...</div>;
    }

    // Handler Submit Checkout
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        if (!selectedAddressId || !paymentProof || !amountPaid) {
            setError("Semua field (Alamat, Bukti Bayar, Jumlah Bayar) wajib diisi.");
            setIsSubmitting(false);
            return;
        }

        if (Number(amountPaid) < totalAmount) {
             setError(`Jumlah bayar minimal adalah Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`);
             setIsSubmitting(false);
             return;
        }
        
        const formData = new FormData();
        formData.append('user_address_id', selectedAddressId);
        formData.append('amount_paid', amountPaid);
        formData.append('payment_proof', paymentProof);

        // (5) KIRIM item_id yang dipilih ke backend
        itemsToCheckout.forEach(item => {
            formData.append('items[]', item.id);
        });

        try {
            // Panggil fungsi checkout dari CartContext
            const response = await processCheckout(formData); 
            
            // Panggil fetchCart() untuk membersihkan keranjang di context
            await fetchCart();

            setSuccess(`Pemesanan berhasil dengan Kode Order: ${response.order_code}! Silakan tunggu validasi admin.`);
            
            // Redirect ke halaman riwayat pesanan
            setTimeout(() => {
                navigate(`/profile/orders`); // <-- Arahkan ke list pesanan
            }, 3000);

        } catch (err) {
            setError(err.message || "Checkout gagal. Silakan cek data Anda.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Tampilan Alamat Kosong
    if (userAddresses.length === 0 && !loadingAddresses) {
        return (
            <div className="container mx-auto p-4 text-center mt-12">
                <p className="text-xl text-red-600">Anda belum memiliki alamat pengiriman.</p>
                <Link to="/profile/addresses" className="text-blue-600 hover:underline">
                    Tambahkan Alamat Baru
                </Link>
            </div>
        );
    }

    // Tampilkan pesan sukses SAJA jika sudah berhasil
    if (success) {
         return (
            <div className="container mx-auto p-4 text-center mt-20">
                <div className="p-6 text-lg text-green-800 bg-green-100 rounded-lg max-w-md mx-auto shadow-lg">
                    ✅ {success}
                    <p className="text-sm mt-2">Anda akan dialihkan ke halaman riwayat pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Selesaikan Pembayaran</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Kolom Kiri: Alamat & Pembayaran */}
                <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-6">
                    {/* Alamat Pengiriman */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                        <h2 className="text-xl font-semibold mb-4 text-blue-700">1. Alamat Pengiriman</h2>
                        <div className="space-y-3">
                            {userAddresses.map(addr => (
                                <label 
                                    key={addr.id} 
                                    className={`block p-3 border rounded-lg cursor-pointer transition ${selectedAddressId === addr.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                        className="mr-2"
                                    />
                                    <span className="font-semibold">{addr.address_label} {addr.is_primary && "(Utama)"}</span>
                                    <p className="text-sm text-gray-600 ml-5">{addr.recipient_name} | {addr.phone_number}</p>
                                    <p className="text-sm text-gray-600 ml-5">{addr.address_line}, {addr.city}, {addr.province} ({addr.postal_code})</p>
                                </label>
                            ))}
                            <Link to="/profile/addresses" className="text-sm text-blue-600 hover:underline">
                                + Tambah atau Kelola Alamat
                            </Link>
                        </div>
                    </div>

                    {/* Pembayaran QRIS */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <h2 className="text-xl font-semibold mb-4 text-green-700">2. Pembayaran (QRIS Manual)</h2>
                        
                        {/* (6) Tampilkan gambar QRIS Anda */}
                        <div className="mb-6 p-4 bg-gray-100 rounded-lg flex flex-col items-center">
                            <p className="text-sm text-gray-700 mb-2">Silakan scan kode QRIS di bawah ini:</p>
                            <img 
                                src={QrisImage} // <-- PERBAIKAN
                                alt="QRIS Pembayaran" 
                                className="w-64 h-64 object-contain rounded-md border" 
                            />
                            <a 
                                href={QrisImage} // <-- PERBAIKAN
                                download="qris_payment.png" 
                                className="mt-3 text-sm text-blue-600 hover:underline"
                            >
                                Unduh QRIS
                            </a>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-lg font-bold text-gray-800 mb-3">Total Pembayaran: <span className="text-red-600">Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span></p>
                        </div>

                        {/* Input Jumlah Bayar */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah yang Anda Bayar (Wajib Diisi)
                            </label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                min={totalAmount}
                                placeholder={`Minimum Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>

                        {/* Input Bukti Pembayaran */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Bukti Pembayaran (JPG/PNG/JPEG)
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={(e) => setPaymentProof(e.target.files[0])}
                                className="w-full text-gray-700 mt-1"
                                required
                            />
                            {paymentProof && <p className="text-xs text-gray-500 mt-1">File terpilih: {paymentProof.name}</p>}
                        </div>
                    </div>
                    
                    {/* Pesan Status */}
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

                    {/* Tombol Submit Final */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedAddressId || !paymentProof || !amountPaid || success}
                        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Memproses Pesanan...' : `Konfirmasi Pembayaran Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`}
                    </button>
                </form>

                {/* Kolom Kanan: Ringkasan Keranjang */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Ringkasan Pesanan</h2>
                        
                        {/* (7) Tampilkan HANYA item yang dicheckout */}
                        {itemsToCheckout.map(item => (
                            <div key={item.id} className="flex justify-between items-start mb-3 border-b border-dashed pb-2">
                                <p className="text-sm text-gray-700 pr-2">{item.quantity}x {item.book.title}</p>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                    Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}

                        {/* (8) Tampilkan 'totalAmount' */}
                        <div className="flex justify-between text-xl font-bold mb-6 pt-4">
                            <span>Total Tagihan</span>
                            <span className="text-indigo-600">Rp{new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
                        </div>
                        <Link to="/cart" className="text-blue-600 hover:underline text-sm">
                            ← Kembali ke Keranjang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
