// Di dalam file AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Pastikan sudah install axios

// Tentukan URL API base Anda
const API_URL = 'http://localhost:8000/api'; // Sesuaikan port jika beda

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); // State untuk loading awal

    // Efek untuk cek token saat aplikasi pertama kali dimuat
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Ambil data user jika token ada
            axios.get(`${API_URL}/user`) // Asumsi Anda punya route /api/user di Laravel
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    // Token tidak valid, hapus
                    localStorage.removeItem('token');
                    setToken(null);
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        // Hapus header auth lama jika ada (untuk login baru)
        delete axios.defaults.headers.common['Authorization'];
        
        const response = await axios.post(`${API_URL}/login`, { email, password });
        
        if (response.data.token && response.data.user) {
            const { token: apiToken, user: apiUser } = response.data;

            // Simpan ke state dan localStorage
            setToken(apiToken);
            setUser(apiUser);
            localStorage.setItem('token', apiToken);
            
            // --- PERUBAHAN PENTING ---
            // Set header default untuk request axios selanjutnya SECARA LANGSUNG
            axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
            // -------------------------
            
            return apiUser; // Kembalikan user data
        }
        throw new Error('Login failed');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Hanya render children jika loading selesai
    if (loading) {
        return <div>Loading...</div>; // Atau buat komponen spinner/loading
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
    return useContext(AuthContext);
};