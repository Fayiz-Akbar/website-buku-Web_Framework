// frontend/src/Context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Kita butuh user untuk tahu keranjang siapa yg diambil

  // Fungsi untuk mengambil data keranjang dari backend
  const fetchCartItems = async () => {
    if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get("/api/cart");
      setCartItems(response.data.data); // Sesuaikan dengan struktur API Resource kamu
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      // Mungkin token expired atau user belum login
      if (error.response && error.response.status === 401) {
          setCartItems([]); // Kosongkan keranjang jika tidak terautentikasi
      }
    } finally {
      setLoading(false);
    }
  };

  // Ambil data keranjang saat user login atau berubah
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  // Fungsi untuk menambah buku ke keranjang
  const addToCart = async (bookId, quantity = 1) => {
    if (!user) {
        alert("Silakan login untuk menambahkan ke keranjang.");
        return;
    }

    try {
      // API backend (POST /api/cart)
      await axios.post("/api/cart", {
        book_id: bookId,
        quantity: quantity,
      });
      // Ambil ulang data keranjang agar update
      await fetchCartItems();
      alert("Buku berhasil ditambahkan ke keranjang!");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Gagal menambahkan ke keranjang.");
    }
  };

  // Fungsi untuk menghapus item dari keranjang
  const removeFromCart = async (cartItemId) => {
    try {
      // API backend (DELETE /api/cart/{id})
      await axios.delete(`/api/cart/${cartItemId}`);
      // Update state lokal (lebih cepat)
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartItemId)
      );
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      alert("Gagal menghapus item.");
    }
  };

  // Fungsi untuk update kuantitas
  const updateQuantity = async (cartItemId, quantity) => {
     if (quantity < 1) {
         // Jika kuantitas 0 atau kurang, hapus item
         return removeFromCart(cartItemId);
     }

    try {
      // API backend (PUT /api/cart/{id})
      const response = await axios.put(`/api/cart/${cartItemId}`, {
        quantity: quantity,
      });
      // Update state lokal
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? response.data.data : item
        )
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Gagal update kuantitas.");
    }
  };
  
  // Hitung total item di keranjang (untuk icon di Navbar)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        fetchCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook untuk mempermudah penggunaan context
export const useCart = () => {
  return useContext(CartContext);
};