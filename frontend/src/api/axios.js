// File: frontend/src/api/axios.js

import axios from 'axios';

// Mengambil Base URL dari environment variable VITE
// Nilai default digunakan jika variabel lingkungan tidak ditemukan.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// =================================================================
// 1. Instance Publik (untuk Login, Register, dan Data Publik)
// =================================================================
// Instance ini tidak secara otomatis menambahkan Authorization Header.
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// =================================================================
// 2. Instance Terotentikasi (untuk endpoint yang dilindungi auth:sanctum)
// =================================================================
// Instance ini akan menggunakan Interceptor untuk menambahkan Bearer Token.
const apiAuth = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 3. Interceptor (Middleware) untuk Menambahkan Bearer Token
// Logic ini dijalankan SEBELUM setiap request yang menggunakan apiAuth dikirim.
apiAuth.interceptors.request.use(
    (config) => {
        // Ambil token dari penyimpanan lokal (localStorage)
        const token = localStorage.getItem('access_token'); 
        
        if (token) {
            // Pasang token di header Authorization sebagai Bearer Token
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Lakukan sesuatu jika ada kesalahan pada request (misalnya, token null)
        return Promise.reject(error);
    }
);


// 4. Export kedua instance untuk digunakan di seluruh aplikasi React
export { api, apiAuth };