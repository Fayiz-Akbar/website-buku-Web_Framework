// Di dalam file AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiAuth } from '../api/axios';

const API_URL = 'http://localhost:8000/api'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('access_token') || null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        if (token) {
            apiAuth.get(`/user`) 
                .then(response => {
                    // Jika token valid, user dimuat
                    setUser(response.data);
                })
                .catch(() => {
                    // Token tidak valid, hapus semua
                    localStorage.removeItem('access_token'); // [PERBAIKAN] Gunakan 'access_token'
                    setToken(null);
                    setUser(null); 
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
            // Gunakan axios standar (api) untuk request login
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data && response.data.token && response.data.user) {
                const { token: apiToken, user: apiUser } = response.data;

                // [PERBAIKAN 3] Simpan token menggunakan 'access_token'
                setToken(apiToken);
                setUser(apiUser);
                localStorage.setItem('access_token', apiToken); 
                
                // [PERBAIKAN 4] HAPUS SEMUA MANIPULASI global header (axios.defaults) dari sini
                
                return apiUser; 
            } else {
                throw new Error('Respons login tidak valid.');
            }
        } catch (error) {
            // Hapus token lama jika ada (jaga-jaga)
            localStorage.removeItem('access_token'); // [PERBAIKAN] Gunakan 'access_token'
            setToken(null);
            setUser(null);
            
            throw error; 
        }
    };
    // --- BATAS PERBAIKAN ---

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('access_token');
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
