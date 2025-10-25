import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    // Kita tetap gunakan state 'name' untuk simpel
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [errors, setErrors] = useState({}); 
    const [apiError, setApiError] = useState(null); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); 
        setApiError(null);

        try {
            // --- INI BAGIAN YANG DIPERBAIKI (1) ---
            // Kita kirim 'full_name' sesuai permintaan backend
            await axios.post('http://localhost:8000/api/register', {
                full_name: name, // Diganti dari 'name'
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            alert('Registrasi berhasil! Silakan login.');
            navigate('/login');

        } catch (error) {
            if (error.response) {
                const data = error.response.data;
                const status = error.response.status;

                if (status === 422) {
                    if (data && data.errors) {
                        setErrors(data.errors);
                    } 
                    else if (data && data.message) {
                        setApiError(data.message);
                    }
                    else {
                        setApiError('Data yang dikirim tidak valid.');
                    }
                } else {
                    setApiError(`Terjadi error: ${status}. Silakan coba lagi nanti.`);
                }
            } else {
                setApiError('Registrasi gagal. Server tidak merespons atau network error.');
                console.error('Registrasi gagal:', error);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Daftar Akun Baru</h2>

                {apiError && (
                    <div className="text-red-700 mb-4 p-3 bg-red-100 border border-red-400 rounded">
                        {apiError}
                    </div>
                )}

                {/* --- INI BAGIAN YANG DIPERBAIKI (2) --- */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        // Cek error 'full_name'
                        className={`w-full p-2 border rounded ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {/* Tampilkan error 'full_name' */}
                    {errors.full_name && <small className="text-red-500">{errors.full_name[0]}</small>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.email && <small className="text-red-500">{errors.email[0]}</small>}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.password && <small className="text-red-500">{errors.password[0]}</small>}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Password</label>
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className={`w-full p-2 border rounded ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                        required
                    />
                    {errors.password_confirmation && <small className="text-red-500">{errors.password_confirmation[0]}</small>}
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200">
                    Daftar
                </button>

                <p className="mt-6 text-center text-sm">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Login di sini
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;

