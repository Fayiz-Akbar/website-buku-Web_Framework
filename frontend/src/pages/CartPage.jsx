// frontend/src/pages/CartPage.jsx

import React from "react";
import { useCart } from "../Context/CartContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const CartPage = () => {
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    updateQuantity, 
    cartCount 
  } = useCart();

  if (loading) {
    return <div className="container p-4 mx-auto text-center">Loading...</div>;
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

  // Menghitung subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.book.price * item.quantity,
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
                  src={item.book.image_url}
                  alt={item.book.title}
                  className="object-cover w-24 h-32 rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.book.title}</h2>
                  <p className="text-sm text-gray-600">{item.book.authors.map(a => a.name).join(', ')}</p>
                  <p className="mt-2 text-lg font-bold text-gray-800">
                    Rp {item.book.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  {/* Tombol Kuantitas */}
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {/* Tombol Hapus */}
                  <button
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

        {/* Ringkasan Pesanan */}
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
              to="/checkout" // Arahkan ke halaman checkout
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