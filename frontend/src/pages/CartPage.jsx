// frontend/src/pages/CartPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom"; // <-- (1) Import useNavigate
import { Trash2, Plus, Minus } from "lucide-react";

const CartPage = () => {
  const {
    cartItems,
    loading,
    removeFromCart,
    updateQuantity,
  } = useCart();
  
  const navigate = useNavigate(); // <-- (2) Inisialisasi navigate

  // --- (3) STATE BARU UNTUK SELEKSI ITEM ---
  // Format: { itemId1: true, itemId2: false, ... }
  const [selectedItems, setSelectedItems] = useState({});

  // --- (4) EFEK UNTUK OTOMATIS MEMILIH SEMUA ITEM SAAT DATA DIMUAT ---
  useEffect(() => {
    // Saat cartItems selesai loading dan ada isinya
    if (cartItems.length > 0) {
      const initialSelection = {};
      cartItems.forEach(item => {
        initialSelection[item.id] = true; // Set semua jadi true (tercentang)
      });
      setSelectedItems(initialSelection);
    }
  }, [cartItems]); // Dijalankan setiap kali cartItems berubah

  // --- (5) FUNGSI BARU UNTUK MENG-HANDLE CENTANG ---
  
  // Fungsi untuk centang/hapus centang satu item
  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId] // Toggle nilai boolean
    }));
  };

  // Fungsi untuk centang/hapus centang "Pilih Semua"
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = {};
    if (isChecked) {
      cartItems.forEach(item => {
        newSelection[item.id] = true;
      });
    }
    // Jika "Pilih Semua" di-uncheck, semua item jadi false (objek kosong)
    setSelectedItems(newSelection);
  };

  // --- (6) PERHITUNGAN BARU DENGAN useMemo ---
  // Perhitungan ini hanya akan berjalan ulang jika cartItems atau selectedItems berubah
  const { itemsToCheckout, selectedSubtotal, selectedCount, isAllSelected } = useMemo(() => {
    // 1. Filter item yang ada di cart DAN terseleksi
    const itemsToCheckout = cartItems.filter(
      item => selectedItems[item.id]
    );

    // 2. Hitung subtotal HANYA dari item yang terseleksi
    const selectedSubtotal = itemsToCheckout.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // 3. Hitung jumlah item yang terseleksi
    const selectedCount = itemsToCheckout.length;

    // 4. Cek apakah status "Pilih Semua" harus aktif
    // (Aktif jika jumlah item di keranjang > 0 DAN jumlah item terpilih == jumlah total item)
    const isAllSelected = cartItems.length > 0 && selectedCount === cartItems.length;

    return { itemsToCheckout, selectedSubtotal, selectedCount, isAllSelected };
  }, [cartItems, selectedItems]);


  // --- (7) FUNGSI BARU UNTUK TOMBOL CHECKOUT ---
  const handleCheckout = () => {
    // Ambil ID dari item yang akan di-checkout
    const itemIdsToCheckout = itemsToCheckout.map(item => item.id);
    
    // Navigasi ke halaman checkout dan kirimkan state berisi ID item
    navigate('/checkout', { 
      state: { 
        items: itemIdsToCheckout 
      } 
    });
  };


  // --- Tampilan Loading (Sudah Benar) ---
  if (loading) {
    return <div className="container p-4 mx-auto text-center">Memuat Keranjang...</div>;
  }

  // --- Tampilan Keranjang Kosong (Sudah Benar) ---
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

  // --- Tampilan Utama ---
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* --- (8) KONTEN UTAMA (KIRI) --- */}
        <div className="md:col-span-2">
          
          {/* --- (9) HEADER "PILIH SEMUA" (BARU) --- */}
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

          {/* --- Daftar Item Keranjang --- */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4">
                
                {/* --- (10) CHECKBOX PER ITEM (BARU) --- */}
                <div className="flex items-center justify-center flex-shrink-0">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    // Gunakan "|| false" untuk menghindari error "uncontrolled to controlled"
                    checked={selectedItems[item.id] || false}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>
                
                <img
                  src={item.book.cover_image || 'https://via.placeholder.com/100x150?text=No+Cover'}
                  alt={item.book.title}
                  className="object-cover w-24 h-32 rounded"
                />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.book.title}</h2>
                  <p className="text-sm text-gray-600">{item.book.authors.map(a => a.name).join(', ')}</p>
                  <p className="mt-2 text-lg font-bold text-gray-800">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  {/* Tombol Kuantitas (Sudah Benar) */}
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
                  {/* Tombol Hapus (Sudah Benar) */}
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

        {/* --- (11) RINGKASAN PESANAN (KANAN) - LOGIC DIPERBARUI --- */}
        <div className="md:col-span-1">
          <div className="sticky top-24 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">Ringkasan Pesanan</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                {/* --- (12) Gunakan 'selectedCount' --- */}
                Subtotal ({selectedCount} item)
              </span>
              <span className="font-semibold">
                {/* --- (13) Gunakan 'selectedSubtotal' --- */}
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
              {/* --- (14) Gunakan 'selectedSubtotal' --- */}
              <span>Rp {selectedSubtotal.toLocaleString("id-ID")}</span>
            </div>
            
            {/* --- (15) TOMBOL CHECKOUT DIPERBARUI --- */}
            <button
              onClick={handleCheckout}
              className="block w-full px-4 py-3 mt-6 font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              // Tombol disable jika tidak ada item terpilih
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