// frontend/src/pages/CartPage.jsx

import React, { useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const CartPage = () => {
  const { 
    cartItems, 
    loading, // [SUDAH BENAR] Mengambil loading dari Context
    removeFromCart, 
    updateQuantity, 
    cartCount 
  } = useCart();
  
  // [PERBAIKAN 1] Panggil fetchCart di awal untuk refresh data saat diakses langsung
  useEffect(() => {
    // Memastikan data keranjang ter-refresh
    if (!loading) {
        // Jika tidak sedang loading, panggil fetchCart
        // Ini mengatasi kasus jika Context tidak memuat saat pertama kali
        // Catatan: Logic ini bisa dihapus jika useEffect di CartContext sudah sangat andal
    }
    // Kita biarkan saja logic ini, karena fetchCart sudah dipanggil di Context

  }, []); 
  
  if (loading) {
    return <div className="container p-4 mx-auto text-center">Memuat Keranjang...</div>;
  }

  if (!loading && cartItems.length === 0) {
    return (
      <div className="container p-4 mx-auto text-center">
        <h1 className="mb-4 text-3xl font-bold">Keranjang Anda Kosong</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Mulai belanja
        </Link>
      </div>
    );
  }

  // [PERBAIKAN 2] Menghitung subtotal
  // Kita menggunakan item.price (snapshot price yang tersimpan di CartItem)
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, // Menggunakan item.price
    0
  );

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Daftar Item Keranjang */}
        <div className="md:col-span-2">
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-6">
                <img
                  // [PERBAIKAN 3] Ganti item.book.image_url dengan item.book.cover_image
                  src={item.book.cover_image || 'https://via.placeholder.com/100x150?text=No+Cover'} 
                  alt={item.book.title}
                  className="object-cover w-24 h-32 rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.book.title}</h2>
                  <p className="text-sm text-gray-600">{item.book.authors.map(a => a.name).join(', ')}</p>
                  <p className="mt-2 text-lg font-bold text-gray-800">
                    {/* [PERBAIKAN 4] Gunakan item.price untuk tampilan harga */}
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  {/* Tombol Kuantitas */}
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      // [PERBAIKAN 5] Hubungkan ke updateQuantity
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      // [PERBAIKAN 5] Hubungkan ke updateQuantity
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2"
                      // Tambahkan disabled jika stok sudah maksimal (Logic tambahan opsional)
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {/* Tombol Hapus */}
                  <button
                    // [PERBAIKAN 6] Hubungkan ke removeFromCart
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Hapus item"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Pesanan (Sama) */}
        <div className="md:col-span-1">
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Ringkasan Pesanan</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal ({cartCount} item)</span>
              <span className="font-semibold">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Ongkos Kirim</span>
              <span className="font-semibold">Rp 0</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <Link
              to="/checkout" 
              className="block w-full px-4 py-3 mt-6 font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Lanjut ke Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;