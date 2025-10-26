import React, { useState, useMemo } from 'react';
import { useCart } from '../Context/CartContext.jsx'; 
import { useNavigate } from 'react-router-dom'; 
// FIX: Tambahkan Loader2 dan ShoppingBag ke import
import { Plus, Minus, Trash2, Loader2, ShoppingBag } from 'lucide-react'; 
import { toast } from 'react-toastify';

// Helper format Rupiah
const formatRupiah = (number) => {
    const numericNumber = Number(number);
    if (isNaN(numericNumber)) {
        return 'Invalid Price';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(numericNumber);
};

export default function CartPage() {
    const navigate = useNavigate();
    const { 
        cartItems, 
        loading, 
        error, 
        removeFromCart, 
        updateQuantity 
        // fetchCart
    } = useCart();

    // State untuk mengelola item mana yang dipilih (checkout)
    const [selectedItems, setSelectedItems] = useState([]); 

    // Memuat ulang keranjang saat komponen dimuat dan inisialisasi selectedItems
    React.useEffect(() => {
        if (cartItems.length > 0 && selectedItems.length === 0) {
            // Secara default, pilih semua item saat pertama kali dimuat jika keranjang tidak kosong
            setSelectedItems(cartItems.map(item => item.id));
        }
    }, [cartItems]);

    // Handler untuk checkbox per item
    const handleSelect = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId) // Hapus jika sudah ada
                : [...prev, itemId] // Tambahkan jika belum ada
        );
    };

    // Handler untuk checkbox 'Pilih Semua'
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };
    
    // Filter item yang akan dihitung dan dicheckout
    const itemsToCheckout = useMemo(() => {
        return cartItems.filter(item => selectedItems.includes(item.id));
    }, [cartItems, selectedItems]);
    
    // Hitung total harga HANYA item yang dipilih
    const subtotal = useMemo(() => {
        return itemsToCheckout.reduce((sum, item) => {
            return sum + (Number(item.price) * item.quantity);
        }, 0);
    }, [itemsToCheckout]);

    const shippingCost = 15000; 
    const total = subtotal + shippingCost;
    const selectedCount = itemsToCheckout.length;

    // FUNGSI INI HARUS DIPANGGIL OLEH TOMBOL CHECKOUT
    const handleCheckout = () => {
        if (selectedCount === 0) {
            toast.warn('Pilih setidaknya satu item untuk dicheckout.');
            return;
        }

        const itemIdsToCheckout = itemsToCheckout.map(item => item.id);
        
        // **PERBAIKAN UTAMA**: Navigasi dan kirim ID item melalui state
        navigate('/checkout', { 
            state: { 
                items: itemIdsToCheckout // Kirim array ID item CartItem
            } 
        });
    };
    
    // Tampilan Loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                {/* FIX: Loader2 sekarang ter-import dan terdefinisi */}
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Tampilan Error
    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500">Terjadi kesalahan saat memuat keranjang: {error}</p>
            </div>
        );
    }
    
    // Tampilan Keranjang Kosong
    if (cartItems.length === 0) {
        return (
            <div className="text-center max-w-lg mx-auto my-20 p-8 bg-white shadow-lg rounded-lg border">
                {/* FIX: ShoppingBag sekarang ter-import dan terdefinisi */}
                <ShoppingBag className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Keranjang Anda kosong.</h2>
                <p className="mt-2 text-gray-500">Ayo, cari buku-buku menarik untuk dibeli!</p>
                <button 
                    onClick={() => navigate('/books')} 
                    className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    Mulai Belanja
                </button>
            </div>
        );
    }

    // Tampilan Utama Keranjang
    return (
        <div className="container p-4 mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Keranjang Belanja Anda ({cartItems.length})</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Bagian Kiri: Daftar Item */}
                <div className="md:col-span-2">
                    {/* Header Pilihan */}
                    <div className="flex items-center p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                            onChange={handleSelectAll}
                            disabled={cartItems.length === 0}
                        />
                        <label className="ml-3 text-lg font-semibold text-gray-700">
                            Pilih Semua ({cartItems.length} Item)
                        </label>
                    </div>

                    {/* Daftar Item */}
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm transition duration-150 ease-in-out hover:shadow-md">
                                
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => handleSelect(item.id)}
                                />
                                
                                {/* Gambar */}
                                <img 
                                    src={item.book.cover_url} 
                                    alt={item.book.title} 
                                    className="w-16 h-24 object-cover rounded-md ml-4 border" 
                                />

                                {/* Detail Item */}
                                <div className="flex-1 ml-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{item.book.title}</h2>
                                    <p className="text-sm text-gray-500">Harga Satuan: {formatRupiah(item.price)}</p>
                                    <p className="text-md font-bold text-blue-600 mt-1">
                                        Total: {formatRupiah(item.price * item.quantity)}
                                    </p>
                                </div>
                                
                                {/* Kontrol Kuantitas */}
                                <div className="flex items-center space-x-2 mr-4 mt-1">
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="p-1 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium text-gray-700">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Hapus */}
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 ml-2 text-red-500 hover:text-red-700 transition duration-150 rounded-full hover:bg-red-50"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bagian Kanan: Ringkasan & Checkout */}
                <div className="md:col-span-1">
                    <div className="sticky top-24 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <h2 className="mb-4 text-2xl font-semibold border-b pb-2">Ringkasan Pesanan</h2>
                        
                        <div className="space-y-2 text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal ({selectedCount} Item)</span>
                                <span className="font-medium text-gray-800">{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Pengiriman</span>
                                <span className="font-medium text-gray-800">{formatRupiah(shippingCost)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{formatRupiah(total)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* **PENTING**: Ganti Link dengan Button yang memanggil handleCheckout */}
                        <button 
                            onClick={handleCheckout}
                            className="mt-6 w-full bg-blue-600 text-white text-center px-6 py-3 rounded-md hover:bg-blue-700 transition-colors block font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={selectedCount === 0}
                        >
                            Lanjut ke Checkout ({selectedCount} Item)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}