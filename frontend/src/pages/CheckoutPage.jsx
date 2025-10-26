// File: frontend/src/pages/CheckoutPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
// (1) Import useLocation untuk menerima 'state' dari navigate
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
// (Saya asumsikan apiAuth ada di '../api/axios', sesuaikan jika beda)
import { apiAuth } from '../api/axios'; 

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    // (2) Ambil SEMUA cartItems dari context
    const { cartItems, loading: loadingCart, processCheckout } = useCart();
    
    // (3) Ambil 'state' yang dikirim dari CartPage
    const location = useLocation();
    const itemIdsFromCart = location.state?.items; // Ini adalah array [id1, id2, ...]

    // States untuk data Checkout
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [paymentProof, setPaymentProof] = useState(null); 
    
    // States untuk UI
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- (4) PERUBAHAN BESAR: Hitung item dan subtotal HANYA untuk item terpilih ---
    const { itemsToCheckout, subtotal } = useMemo(() => {
        // Jika tidak ada data ID dari cart, atau cartItems belum load
        if (!itemIdsFromCart || !cartItems) {
            return { itemsToCheckout: [], subtotal: 0 };
        }
        
        // Filter cartItems berdasarkan ID yang dikirim dari location.state
        const filteredItems = cartItems.filter(item => 
            itemIdsFromCart.includes(item.id)
        );
          
        // Hitung subtotal HANYA dari item yang difilter
        const newSubtotal = filteredItems.reduce(
            (total, item) => total + item.price * item.quantity, 0
        );
          
        return { itemsToCheckout: filteredItems, subtotal: newSubtotal };

    }, [cartItems, itemIdsFromCart]); // <-- Kalkulasi ulang jika data berubah
    // --- Batas Perubahan ---

    const totalAmount = subtotal; // Total = subtotal (belum ada ongkir/pajak)

    // Effect untuk memuat Alamat User (Tidak berubah, sudah benar)
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return; 
            try {
                const response = await apiAuth.get('/user/addresses'); 
                const addresses = response.data.data;
                setUserAddresses(addresses);
                
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

        // (Perbaikan kecil: Cukup cek 'user' saja)
        if (user && userAddresses.length === 0) {
            fetchAddresses();
        }
    }, [user]); // <-- Dependency array disederhanakan

    // --- (5) PERUBAHAN: Redirect jika item *terpilih* kosong ---
    // (Ini juga menangani kasus jika user akses /checkout langsung tanpa state)
    if (!loadingCart && itemsToCheckout.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center mt-12">
                <p className="text-xl">Tidak ada item yang dipilih untuk dicheckout.</p>
                <p>
                    <Link to="/cart" className="text-blue-600 hover:underline">Kembali ke Keranjang</Link>
                    {' atau '}
                    <Link to="/" className="text-blue-600 hover:underline">Ayo belanja.</Link>
                </p>
            </div>
        );
    }
    
    // Tampilan Loading (Sudah Benar)
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

        // Validasi jumlah bayar (opsional tapi bagus)
        if (parseFloat(amountPaid) < totalAmount) {
            setError(`Jumlah bayar minimum adalah Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`);
            setIsSubmitting(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('user_address_id', selectedAddressId);
        formData.append('amount_paid', amountPaid);
        formData.append('payment_proof', paymentProof);

        // --- (6) PERUBAHAN PENTING: Kirim ID item yang dipilih ke backend ---
        // Backend perlu tahu item mana saja yang di-checkout
        itemsToCheckout.forEach(item => {
            // Kita kirim sebagai array 'items[]'
            formData.append('items[]', item.id);
        });
        // --- Batas Perubahan ---

        try {
            // Asumsi: processCheckout(formData) akan POST ke '/api/checkout'
            const response = await processCheckout(formData); 
            
            setSuccess(`Pemesanan berhasil dengan Kode Order: ${response.order_id}! Silakan tunggu konfirmasi admin.`);
            
            // Tunda navigasi agar user bisa baca pesan sukses
            setTimeout(() => {
                // Arahkan ke halaman detail order (jika ada)
                navigate(`/profile/orders`); // (Atau ganti ke /profile/orders/${response.order_id} jika halaman itu ada)
            }, 3000);

        } catch (err) {
            // Tangkap error validasi dari backend (jika ada)
            if (err.response && err.response.status === 422) {
                 setError("Checkout gagal: " + err.response.data.message);
            } else {
                setError(err.message || "Checkout gagal. Silakan cek data Anda.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Tampilan Alamat Kosong (Sudah Benar)
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
                    {/* Alamat Pengiriman (Tidak berubah, sudah benar) */}
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

                    {/* Pembayaran QRIS (Tidak berubah, sudah benar) */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
                        <h2 className="text-xl font-semibold mb-4 text-green-700">2. Pembayaran (QRIS Manual)</h2>
                        <div className="mb-4">
                            <p className="text-lg font-bold text-gray-800 mb-3">Total Pembayaran: <span className="text-red-600">Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span></p>
                        </div>
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
                    
                    {/* Pesan Status (Tidak berubah, sudah benar) */}
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

                    {/* Tombol Submit Final (Sudah Benar) */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedAddressId || !paymentProof || !amountPaid || success}
                        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Memproses Pesanan...' : `Konfirmasi Pembayaran Rp ${new Intl.NumberFormat('id-ID').format(totalAmount)}`}
                    </button>
                </form>

                {/* --- (7) PERUBAHAN: Ringkasan Keranjang --- */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Ringkasan Pesanan</h2>
                        
                        {/* (8) Tampilkan HANYA item yang dicheckout */}
                        {itemsToCheckout.map(item => (
                            <div key={item.id} className="flex justify-between items-start mb-3 border-b border-dashed pb-2">
                                <p className="text-sm text-gray-700 pr-2">{item.quantity}x {item.book.title}</p>
                                <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                                    Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}

                        {/* (9) Tampilkan 'totalAmount' (yang sudah dihitung dari item terpilih) */}
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