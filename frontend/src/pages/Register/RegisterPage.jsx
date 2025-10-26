// File: frontend/src/pages/Register/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiPublic } from '../../api/axios';
// Asumsi: Anda sudah membuat file axios.js

const RegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setApiError(null);
        setSuccessMsg(null);

        try {
            // Panggil endpoint register Laravel
            const response = await apiPublic.post('/register', formData);

            // --- Registrasi Berhasil (Status 201) ---
            // Pesan sukses dari backend: response.data.message
            setSuccessMsg(response.data.message || 'Registrasi berhasil! Silakan cek email Anda dan login.');
            
            // Bersihkan form
            setFormData({ full_name: '', email: '', password: '', password_confirmation: '' });

            // Arahkan ke halaman login setelah 3 detik
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error('Registrasi Gagal:', error.response || error);
            
            if (error.response) {
                const { status, data } = error.response;

                if (status === 422) {
                    // Error validasi dari Laravel
                    if (data && data.errors) {
                        setErrors(data.errors);
                    } else if (data && data.message) {
                        setApiError(data.message);
                    }
                } else {
                    // Error non-validasi (misal 500 jika PHPMailer error)
                    // Jika 500, tampilkan pesan generik
                    setApiError(`Pendaftaran berhasil tetapi terjadi error (${status}) pada pengiriman email. ${data.message || 'Silakan cek log server.'}`);
                }
            } else {
                setApiError('Registrasi gagal. Server tidak merespons atau network error.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun Baru</h2>
                
                {/* Feedback Sukses */}
                {successMsg && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded mb-4">
                        {successMsg}
                    </div>
                )}

                {/* Feedback General Error */}
                {apiError && (
                    <div className="text-red-700 mb-4 p-3 bg-red-100 border border-red-400 rounded">
                        {apiError}
                    </div>
                )}

                {/* --- Form Fields (Tetap sama) --- */}
                
                {/* Nama Lengkap (full_name) */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                    <input
                        type="text"
                        name="full_name" 
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.full_name && <small className="text-red-500">{errors.full_name[0]}</small>}
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.email && <small className="text-red-500">{errors.email[0]}</small>}
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.password && <small className="text-red-500">{errors.password[0]}</small>}
                </div>

                {/* Konfirmasi Password */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Password</label>
                    <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.password_confirmation && <small className="text-red-500">{errors.password_confirmation[0]}</small>}
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
                >
                    {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                </button>

                <p className="mt-6 text-center text-sm">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Masuk di sini
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;