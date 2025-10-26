// File: frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { apiAuth } from '../api/axios'; // Import client terotentikasi

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, loading: loadingCart, processCheckout } = useCart();

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

    // Hitung Subtotal
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalAmount = subtotal; // Untuk saat ini, total sama dengan subtotal

    // Effect untuk memuat Alamat User
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return; // Tunggu user dimuat

            try {
                // [ASUMSI API] Endpoint untuk mengambil alamat user yang terotentikasi
                const response = await apiAuth.get('/user/addresses'); 
                const addresses = response.data.data;
                setUserAddresses(addresses);
                
                // Set alamat utama/pertama sebagai default yang dipilih
                const primary = addresses.find(addr => addr.is_primary) || addresses[0];
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

        if (userAddresses.length === 0) {
            fetchAddresses();
        }
    }, [user, userAddresses.length]);

    // Redirect jika keranjang kosong
    if (!loadingCart && cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center mt-12">
                <p className="text-xl">Keranjang Anda kosong! <Link to="/" className="text-blue-600 hover:underline">Ayo belanja.</Link></p>
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
        
        // 1. Buat instance FormData untuk file upload
        const formData = new FormData();
        formData.append('user_address_id', selectedAddressId);
        formData.append('amount_paid', amountPaid);
        formData.append('payment_proof', paymentProof); // File harus dimasukkan sebagai object file

        try {
            // 2. Panggil fungsi checkout dari CartContext
            const response = await processCheckout(formData); 
            
            // 3. Sukses
            setSuccess(`Pemesanan berhasil dengan Kode Order: ${response.order_id}! Silakan tunggu konfirmasi admin.`);
            // Redirect ke halaman detail order (jika ada) atau halaman sukses
            setTimeout(() => {
                navigate(`/profile/orders/${response.order_id}`); 
            }, 5000);

        } catch (err) {
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
                                Kelola Alamat
                            </Link>
                        </div>
                    </div>

                    {/* Pembayaran QRIS */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <h2 className="text-xl font-semibold mb-4 text-green-700">2. Pembayaran (QRIS Manual)</h2>
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
                    {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

                    {/* Tombol Submit Final */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedAddressId || !paymentProof || !amountPaid}
                        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Memproses Pesanan...' : `Konfirmasi Pembayaran Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`}
                    </button>
                </form>

                {/* Kolom Kanan: Ringkasan Keranjang */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Ringkasan Keranjang</h2>
                        
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-start mb-3 border-b border-dashed pb-2">
                                <p className="text-sm text-gray-700 pr-2">{item.quantity}x {item.book.title}</p>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                    Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}

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