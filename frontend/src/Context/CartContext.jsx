// frontend/src/Context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
// --- PERBAIKAN: Gunakan import axios standar dari NPM (mengabaikan file lokal yang rusak) ---
import axios from "axios"; 
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  // Fungsi untuk mengambil data keranjang dari backend
  const fetchCartItems = async () => {
    if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      // Menggunakan axios standar dari npm
      const response = await axios.get("http://localhost:8000/api/cart");
      setCartItems(response.data.data); 
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      if (error.response && error.response.status === 401) {
          setCartItems([]); 
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
      // Menggunakan axios standar dari npm
      await axios.post("http://localhost:8000/api/cart", {
        book_id: bookId,
        quantity: quantity,
      });
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
      await axios.delete(`http://localhost:8000/api/cart/${cartItemId}`);
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
         return removeFromCart(cartItemId);
     }

    try {
      const response = await axios.put(`http://localhost:8000/api/cart/${cartItemId}`, {
        quantity: quantity,
      });
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
