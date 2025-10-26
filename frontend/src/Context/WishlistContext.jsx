import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext'; // Path relatif yang benar

// 1. Buat Context
const WishlistContext = createContext();

// 2. Buat Provider
export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, token } = useAuth();

    // Fungsi fetch wishlist dari backend (Asumsi API ada)
    const fetchWishlist = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Asumsi API backend: GET /api/wishlist
            // const response = await axios.get('http://localhost:8000/api/wishlist');
            // setWishlistItems(response.data.items || []); 

            // --- DATA DUMMY (Hapus jika API sudah ada) ---
            console.log("Fetching wishlist (dummy)");
            // Misal: Ambil data dari localStorage atau set kosong
            const savedWishlist = localStorage.getItem('dummyWishlist');
            setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
            // --- BATAS DATA DUMMY ---

        } catch (error) {
            console.error("Gagal mengambil data wishlist:", error);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch saat login/logout
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlistItems([]); // Kosongkan saat logout
        }
    }, [user, token]);

    // Fungsi tambah/hapus dari wishlist
    const toggleWishlist = async (book) => {
        if (!book || !book.id) return; // Pastikan book valid

        setLoading(true);
        const bookId = book.id;
        const isCurrentlyFavorite = wishlistItems.some(item => item.id === bookId);

        try {
            if (isCurrentlyFavorite) {
                // Asumsi API backend: DELETE /api/wishlist/remove/{bookId}
                // await axios.delete(`http://localhost:8000/api/wishlist/remove/${bookId}`);
                console.log(`Removing book ${bookId} from wishlist (dummy)`);

                // --- LOGIKA DUMMY (Hapus jika API sudah ada) ---
                const updatedWishlist = wishlistItems.filter(item => item.id !== bookId);
                setWishlistItems(updatedWishlist);
                localStorage.setItem('dummyWishlist', JSON.stringify(updatedWishlist));
                // --- BATAS LOGIKA DUMMY ---

            } else {
                // Asumsi API backend: POST /api/wishlist/add
                // await axios.post('http://localhost:8000/api/wishlist/add', { book_id: bookId });
                console.log(`Adding book ${bookId} to wishlist (dummy)`);

                 // --- LOGIKA DUMMY (Hapus jika API sudah ada) ---
                 const updatedWishlist = [...wishlistItems, book]; // Tambahkan object book utuh
                 setWishlistItems(updatedWishlist);
                 localStorage.setItem('dummyWishlist', JSON.stringify(updatedWishlist));
                 // --- BATAS LOGIKA DUMMY ---
            }
            // Optional: fetch ulang jika respons API tidak mengembalikan data terbaru
            // await fetchWishlist(); 
        } catch (error) {
            console.error("Gagal toggle wishlist:", error);
            alert('Gagal memperbarui wishlist. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk cek apakah buku ada di wishlist
    const isInWishlist = (bookId) => {
        return wishlistItems.some(item => item.id === bookId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            toggleWishlist,
            isInWishlist,
            fetchWishlist, // Export fetch jika dibutuhkan di tempat lain
            loading
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

// 3. Buat Custom Hook
export const useWishlist = () => {
    return useContext(WishlistContext);
};
