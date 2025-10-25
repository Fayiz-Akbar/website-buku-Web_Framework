// Di dalam file AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get(`${API_URL}/user`) 
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    // Token tidak valid, hapus
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null); // Pastikan user juga di-null-kan
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    // --- FUNGSI LOGIN YANG DIPERBAIKI ---
    const login = async (email, password) => {
        
        // 1. Bungkus semua dengan try...catch
        try {
            // Hapus header auth lama jika ada
            delete axios.defaults.headers.common['Authorization'];
            
            // 2. Coba lakukan request login
            const response = await axios.post(`${API_URL}/login`, { email, password });

            // 3. Cek jika backend merespons DENGAN token dan user
            if (response.data && response.data.token && response.data.user) {
                const { token: apiToken, user: apiUser } = response.data;

                // 4. Simpan state
                setToken(apiToken);
                setUser(apiUser);
                localStorage.setItem('token', apiToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
                
                return apiUser; // Kembalikan user data ke LoginPage
            } else {
                // Seharusnya tidak terjadi, tapi jika backend 200 OK tapi data aneh
                throw new Error('Respons login tidak valid.');
            }
        } catch (error) {
            // 5. Jika axios GAGAL (401, 422, 500)
            // Hapus token lama jika ada (jaga-jaga)
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            
            // 6. Lempar error ini kembali ke LoginPage.jsx agar bisa ditangani di sana
            throw error; 
        }
    };
    // --- BATAS PERBAIKAN ---

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
