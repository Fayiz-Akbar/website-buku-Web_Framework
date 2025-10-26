// Di dalam file AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
// HAPUS: import axios from 'axios';
// TAMBAHKAN: import dari file axios.js Anda
import { apiAuth, apiPublic, setAuthToken } from '../api/axios';

export const AuthContext = createContext(null);
// HAPUS: const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"; (Tidak perlu lagi)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        if (token) {
            // GUNAKAN setAuthToken untuk instance apiAuth
            setAuthToken(token); 
            
            // GUNAKAN apiAuth untuk mengambil data user
            apiAuth.get('/user') 
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    // Token tidak valid, hapus
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    setAuthToken(null); // Hapus token dari apiAuth juga
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
        try {
            // Hapus header auth lama (jika ada) dari apiAuth
            setAuthToken(null);
            
            // GUNAKAN apiPublic untuk request login
            const response = await apiPublic.post('/login', { email, password });

            if (response.data && response.data.token && response.data.user) {
                const { token: apiToken, user: apiUser } = response.data;

                // Simpan state
                setToken(apiToken);
                setUser(apiUser);
                localStorage.setItem('token', apiToken);
                
                // Atur token di instance apiAuth
                setAuthToken(apiToken); 
                
                return apiUser; 
            } else {
                throw new Error('Respons login tidak valid.');
            }
        } catch (error) {
            // Jika gagal, pastikan semua bersih
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setAuthToken(null);
            
            throw error; 
        }
    };
    // --- BATAS PERBAIKAN ---

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        // Hapus token dari instance apiAuth
        setAuthToken(null); 
    };

    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider
            value={{ user, setUser, token, login, logout, updateUser, isLoggedIn: !!token }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
