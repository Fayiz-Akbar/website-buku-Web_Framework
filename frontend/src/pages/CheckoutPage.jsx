// File: frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext.jsx'; // Menggunakan .jsx
import { useAuth } from '../Context/AuthContext.jsx'; // Menggunakan .jsx
import { apiAuth } from '../api/axios.js'; // Menggunakan .js
import { Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import QrisImage from '../assets/qris_payment.jpg'; // <-- PERBAIKAN: Menggunakan gambar QRIS Anda

// Fungsi helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation(); // <-- PENTING: Untuk mengambil state dari CartPage
    const { user } = useAuth();
    const { cartItems, loading: loadingCart, processCheckout } = useCart();

    // [PERBAIKAN] Ambil ID item yang dipilih dari 'location.state'
    const [itemIdsToCheckout, setItemIdsToCheckout] = useState(location.state?.items || []);

    // States untuk data Checkout
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentProof, setPaymentProof] = useState(null); // State untuk file
    
    // States untuk UI
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // [PERBAIKAN] Hitung item dan total HANYA berdasarkan item yang dipilih
    const { itemsToCheckout, totalAmount } = useMemo(() => {
        if (!cartItems || cartItems.length === 0) {
            return { itemsToCheckout: [], totalAmount: 0 };
        }
        // Filter item keranjang berdasarkan ID yang dikirim dari CartPage
        const filteredItems = cartItems.filter(item => itemIdsToCheckout.includes(item.id));
        const total = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { itemsToCheckout: filteredItems, totalAmount: total };
    }, [cartItems, itemIdsToCheckout]);

    // Effect untuk memuat Alamat User
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return; 
            setLoadingAddresses(true);
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
                setError("Gagal memuat alamat pengiriman. Silakan coba lagi.");
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, [user]); // Hanya bergantung pada user

    // Tampilan Loading
    if (loadingCart || loadingAddresses || !user) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Memuat data checkout...</span>
            </div>
        );
    }

    // [PERBAIKAN] Tampilkan error jika tidak ada item TERPILIH
    // Ini adalah halaman yang Anda lihat di screenshot
    if (itemsToCheckout.length === 0) {
        return (
            <div className="text-center max-w-lg mx-auto my-20 p-8 bg-white shadow-lg rounded-lg border">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Tidak ada item yang dipilih untuk dicheckout.</h2>
                <p className="mt-4 text-gray-600">
                    <Link to="/cart" className="text-blue-600 hover:underline font-medium">Kembali ke Keranjang</Link>
                    <span className="mx-2">atau</span>
                    <Link to="/" className="text-blue-600 hover:underline font-medium">Ayo belanja.</Link>
                </p>
            </div>
        );
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
        
        // Buat instance FormData untuk file upload
        const formData = new FormData();
        formData.append('user_address_id', selectedAddressId);
        formData.append('amount_paid', amountPaid);
        formData.append('payment_proof', paymentProof); 

        // [PERBAIKAN] Kirim HANYA ID item yang dipilih
        itemsToCheckout.forEach(item => {
            formData.append('items[]', item.id);
        });

        try {
            // Panggil fungsi checkout dari CartContext
            const response = await processCheckout(formData); 
            
            setSuccess(`Pemesanan berhasil! Kode Pesanan Anda: ${response.order_code}. Silakan tunggu konfirmasi admin.`);
            
            // Arahkan ke halaman detail pesanan baru
            setTimeout(() => {
                navigate(`/profile/orders/${response.order_id}`); 
            }, 3000);

        } catch (err) {
            console.error("Checkout Error:", err);
            setError(err.message || "Checkout gagal. Silakan cek data Anda.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Tampilan Alamat Kosong
    if (userAddresses.length === 0) {
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
                <div className="p-6 text-lg text-green-800 bg-green-100 rounded-lg max-w-md mx-auto shadow-lg border border-green-200">
                    <ShieldCheck className="w-12 h-12 mx-auto text-green-600 mb-3" />
                    <p className="font-semibold">{success}</p>
                    <p className="text-sm mt-2">Anda akan dialihkan ke halaman riwayat pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50">
            <Link to="/cart" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Keranjang
            </Link>
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Kolom Kiri: Alamat & Pembayaran */}
                <form onSubmit={handleSubmit} className="lg:w-2/3 space-y-6">
                    {/* Alamat Pengiriman */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
                                        className="mr-3"
                                    />
                                    <span className="font-semibold">{addr.address_label} {addr.is_primary && "(Utama)"}</span>
                                    <p className="text-sm text-gray-600 ml-6">{addr.recipient_name} | {addr.phone_number}</p>
                                    <p className="text-sm text-gray-600 ml-6">{addr.address_line}, {addr.city}, {addr.province} ({addr.postal_code})</p>
                                </label>
                            ))}
                            <Link to="/profile/addresses" className="text-sm text-blue-600 hover:underline ml-1">
                                Kelola Alamat
                            </Link>
                        </div>
                    </div>

                    {/* Pembayaran QRIS */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-green-700">2. Pembayaran (QRIS Manual)</h2>
                        
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-col items-center border">
                            <p className="text-sm text-gray-700 mb-3">Silakan scan kode QRIS di bawah ini:</p>
                            <img 
                                src={QrisImage} 
                                alt="QRIS Pembayaran" 
                                className="w-64 h-64 object-contain rounded-md border" 
                            />
                            <a 
                                href={QrisImage} 
                                download="qris_pembayaran.png" 
                                className="mt-3 text-sm text-blue-600 hover:underline"
                            >
                                Unduh QRIS
                            </a>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-lg font-bold text-gray-800 mb-3">Total Pembayaran: <span className="text-red-600">{formatRupiah(totalAmount)}</span></p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Input Jumlah Bayar */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount_paid">
                                    Jumlah yang Anda Bayar
                                </label>
                                <input
                                    type="number"
                                    id="amount_paid"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    min="1"
                                    placeholder="Contoh: 50000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>

                            {/* Input Bukti Pembayaran */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="payment_proof">
                                    Upload Bukti Pembayaran
                                </label>
                                <input
                                    type="file"
                                    id="payment_proof"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={(e) => setPaymentProof(e.target.files[0])}
                                    className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                                {paymentProof && <p className="text-xs text-gray-500 mt-1">File: {paymentProof.name}</p>}
                            </div>
                        </div>
                    </div>
                    
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedAddressId || !paymentProof || !amountPaid}
                        className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold transition shadow-lg hover:shadow-blue-500/50 disabled:bg-gray-400 disabled:shadow-none"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : `Konfirmasi & Bayar ${formatRupiah(totalAmount)}`}
                    </button>
                </form>

                {/* Kolom Kanan: Ringkasan Keranjang */}
                <div className="lg:w-1/3">
                    <div className="sticky top-24 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Ringkasan Pesanan ({itemsToCheckout.length} Item)</h2>
                        
                        <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                            {itemsToCheckout.map(item => (
                                <div key={item.id} className="flex justify-between items-start gap-3">
                                    <img 
                                        src={item.book.cover_url || `https://placehold.co/80x120/e2e8f0/64748b?text=Book`}
                                        alt={item.book.title}
                                        className="w-12 h-16 object-cover rounded border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.book.title}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                                        {formatRupiah(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 mt-4 space-y-1">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatRupiah(totalAmount)}</span>
                            </div>
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>Ongkos Kirim</span>
                                <span className="font-medium">Rp 0</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                                <span>Total</span>
                                <span>{formatRupiah(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

