// File: frontend/src/Context/CartContext.jsx (Versi Lengkap dan Diperbaiki)

import React, { createContext, useContext, useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan ekstensi file .js
import { apiAuth } from '../api/axios.js'; 
// PERBAIKAN: Menambahkan ekstensi file .jsx
import { useAuth } from './AuthContext.jsx'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const { isLoggedIn, loading: authLoading } = useAuth();

    const fetchCart = async () => {
        if (!isLoggedIn) {
            setCartItems([]);
            setCartCount(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiAuth.get('/cart'); 
            const items = response.data.data;
            const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

            setCartItems(items);
            setCartCount(totalCount);
            setError(null);
        } catch (err) {
            console.error("Gagal memuat keranjang:", err.response || err);
            setError("Gagal memuat data keranjang.");
            // Reset keranjang jika terjadi error (misal token expired -> 401)
            setCartItems([]);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (book_id, quantity = 1) => {
        if (!isLoggedIn) return false;
        try {
            await apiAuth.post('/cart/add', { book_id, quantity });
            // Panggil fetchCart() untuk sinkronisasi data
            fetchCart(); 
            return true;
        } catch (err) {
            // Tampilkan pesan error dari backend (misal stok tidak cukup)
            alert(err.response?.data?.message || "Gagal menambah ke keranjang. Stok tidak cukup.");
            return false;
        }
    };
    
    // [PERBAIKAN URL] FUNGSI HAPUS DARI KERANJANG
    const removeFromCart = async (cartItemId) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus item ini dari keranjang?")) {
            return; 
        }
        try {
            // URL diperbaiki: dari /cart/remove/{id} menjadi /cart/{id}
            await apiAuth.delete(`/cart/${cartItemId}`);
            fetchCart(); 
        } catch (err) {
            console.error("Gagal menghapus item:", err.response || err);
            alert("Gagal menghapus item dari keranjang.");
        }
    };

    // [PERBAIKAN URL] FUNGSI UPDATE KUANTITAS
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            // Jika kuantitas 0 atau kurang, panggil fungsi hapus
            return removeFromCart(cartItemId);
        }
        
        try {
            // URL diperbaiki: dari /cart/update/{id} menjadi /cart/{id}
            await apiAuth.put(`/cart/${cartItemId}`, { quantity: newQuantity });
            fetchCart();
        } catch (err) {
            console.error("Gagal update kuantitas:", err.response || err);
            // Tampilkan pesan error dari backend (misal stok tidak cukup)
            alert(err.response?.data?.message || "Gagal mengubah kuantitas. Stok buku tidak cukup.");
        }
    };

    // FUNGSI PROSES CHECKOUT
    const processCheckout = async (formData) => {
        if (!isLoggedIn) {
            throw new Error("Anda harus login untuk menyelesaikan checkout.");
        }
        
        try {
            const response = await apiAuth.post('/checkout', formData);
            // Kosongkan keranjang di frontend setelah checkout berhasil
            fetchCart(); 
            return response.data;
        } catch (err) {
            // Lempar error agar bisa ditangani oleh CheckoutPage.jsx
            throw new Error(err.response?.data?.message || err.response?.data?.errors?.user_address_id?.[0] || "Checkout gagal. Cek input dan stok buku.");
        }
    };


    useEffect(() => {
        // Hanya fetch keranjang jika proses loading auth sudah selesai
        if (!authLoading) {
            fetchCart();
        }
    }, [isLoggedIn, authLoading]); // <-- Tambahkan authLoading sebagai dependency

    const contextValue = {
        cartItems,
        cartCount,
        loading, 
        error,
        fetchCart,
        addToCart,
        removeFromCart, 
        updateQuantity, 
        processCheckout,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};

