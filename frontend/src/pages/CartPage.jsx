// frontend/src/pages/CartPage.jsx

// (1) Ambil SEMUA import yang diperlukan dari kedua versi
import React, { useEffect, useState, useMemo } from "react";
import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom"; 
import { Trash2, Plus, Minus } from "lucide-react";

const CartPage = () => {
  // (2) Ambil hooks dari versi HEAD (baru)
  const {
    cartItems,
    loading,
    removeFromCart,
    updateQuantity,
  } = useCart();
  
  const navigate = useNavigate(); 

  // (3) State untuk seleksi item (dari HEAD)
  const [selectedItems, setSelectedItems] = useState({});

  // (4) Efek untuk otomatis memilih semua item (dari HEAD)
  useEffect(() => {
    if (cartItems.length > 0) {
      const initialSelection = {};
      cartItems.forEach(item => {
        initialSelection[item.id] = true; 
      });
      setSelectedItems(initialSelection);
    }
  }, [cartItems]); 

  // (5) Fungsi untuk handle centang (dari HEAD)
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId] 
    }));
  };

  // Fungsi untuk centang/hapus centang "Pilih Semua" (dari HEAD)
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = {};
    if (isChecked) {
      cartItems.forEach(item => {
        newSelection[item.id] = true;
      });
    }
    setSelectedItems(newSelection);
  };

  // (6) Perhitungan baru dengan useMemo (dari HEAD)
  const { itemsToCheckout, selectedSubtotal, selectedCount, isAllSelected } = useMemo(() => {
    const itemsToCheckout = cartItems.filter(
      item => selectedItems[item.id]
    );
    const selectedSubtotal = itemsToCheckout.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const selectedCount = itemsToCheckout.length;
    const isAllSelected = cartItems.length > 0 && selectedCount === cartItems.length;

    return { itemsToCheckout, selectedSubtotal, selectedCount, isAllSelected };
  }, [cartItems, selectedItems]);

  // (7) Fungsi untuk tombol checkout (dari HEAD)
  const handleCheckout = () => {
    const itemIdsToCheckout = itemsToCheckout.map(item => item.id);
    navigate('/checkout', { 
      state: { 
        items: itemIdsToCheckout 
      } 
    });
  };

  // Tampilan Loading (Sama)
  if (loading) {
    return <div className="container p-4 mx-auto text-center">Memuat Keranjang...</div>;
  }

  // Tampilan Keranjang Kosong (Sama)
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

  // (8) Tampilan Utama (Gabungan)
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Konten Utama (Kiri) */}
        <div className="md:col-span-2">
          
          {/* Header "PILIH SEMUA" (dari HEAD) */}
          <div className="flex items-center p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <input
              type="checkbox"
              id="selectAll"
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAll" className="ml-3 text-lg font-semibold text-gray-700">
              Pilih Semua ({cartItems.length} produk)
            </label>
          </div>

          {/* Daftar Item Keranjang */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                
                {/* CHECKBOX PER ITEM (dari HEAD) */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedItems[item.id] || false}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>
                
                <img
                  // --- (FIX 1) Ambil perbaikan 'cover_url' dari '63ea050' ---
                  src={item.book.cover_url || 'https://via.placeholder.com/100x150?text=No+Cover'} 
                  alt={item.book.title}
                  className="object-cover w-24 h-32 rounded"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100x150?text=Error'; }}
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.book.title}</h2>
                  <p className="text-sm text-gray-600">
                    {/* (FIX 2) Ambil perbaikan optional chaining 'authors' dari '63ea050' */}
                    {item.book.authors?.map(a => a.name || a.full_name).join(', ') || 'Penulis tidak diketahui'}
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-800">
                    {/* (FIX 3) Ambil perbaikan format harga 'Number()' dari '63ea050' */}
                    Rp {Number(item.price).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  {/* Tombol Kuantitas (Sama) */}
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
                  {/* Tombol Hapus (Sama) */}
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

        {/* RINGKASAN PESANAN (KANAN) - (dari HEAD) */}
        <div className="md:col-span-1">
          <div className="sticky top-24 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Ringkasan Pesanan</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                {/* Gunakan 'selectedCount' */}
                Subtotal ({selectedCount} item)
              </span>
              <span className="font-semibold">
                {/* Gunakan 'selectedSubtotal' */}
                Rp {selectedSubtotal.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Ongkos Kirim</span>
              <span className="font-semibold">Rp 0</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              {/* Gunakan 'selectedSubtotal' */}
              <span>Rp {selectedSubtotal.toLocaleString("id-ID")}</span>
            </div>
            
            {/* TOMBOL CHECKOUT (dari HEAD) */}
            <button
              onClick={handleCheckout}
              className="block w-full px-4 py-3 mt-6 font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedCount === 0}
            >
              Lanjut ke Checkout ({selectedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;