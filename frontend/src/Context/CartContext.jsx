// File: frontend/src/Context/CartContext.jsx (Versi Lengkap)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiAuth } from '../api/axios'; 
import { useAuth } from './AuthContext'; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const { isLoggedIn } = useAuth(); 

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
            fetchCart();
            return true;
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menambah ke keranjang. Stok tidak cukup.");
            return false;
        }
    };
    
    // [LOGIC BARU] FUNGSI HAPUS DARI KERANJANG
    const removeFromCart = async (cartItemId) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus item ini dari keranjang?")) {
            return; 
        }
        try {
            await apiAuth.delete(`/cart/remove/${cartItemId}`);
            fetchCart(); 
        } catch (err) {
            console.error("Gagal menghapus item:", err.response || err);
            alert("Gagal menghapus item dari keranjang.");
        }
    };

    // [LOGIC BARU] FUNGSI UPDATE KUANTITAS
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            return removeFromCart(cartItemId);
        }
        
        try {
            await apiAuth.put(`/cart/update/${cartItemId}`, { quantity: newQuantity });
            fetchCart();
        } catch (err) {
            console.error("Gagal update kuantitas:", err.response || err);
            alert(err.response?.data?.message || "Gagal mengubah kuantitas. Stok buku tidak cukup.");
        }
    };

    // [LOGIC BARU] FUNGSI PROSES CHECKOUT (dari langkah sebelumnya)
    const processCheckout = async (formData) => {
        if (!isLoggedIn) {
            throw new Error("Anda harus login untuk menyelesaikan checkout.");
        }
        
        try {
            const response = await apiAuth.post('/checkout', formData);
            fetchCart(); 
            return response.data;
        } catch (err) {
            // Ini akan ditangani oleh CheckoutPage.jsx
            throw new Error(err.response?.data?.message || err.response?.data?.errors?.user_address_id?.[0] || "Checkout gagal. Cek input dan stok buku.");
        }
    };


    useEffect(() => {
        fetchCart();
    }, [isLoggedIn]); 

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