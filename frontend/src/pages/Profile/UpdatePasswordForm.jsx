import React, { useState } from 'react';
import axios from 'axios';
import { Key, Lock, Save } from 'lucide-react';

export default function UpdatePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validasi sisi klien sederhana
        if (newPassword !== newPasswordConfirmation) {
            setError('Konfirmasi password baru tidak cocok.');
            setLoading(false);
            return;
        }

        try {
            // Asumsi API endpoint: POST /api/user/password
            await axios.post('http://localhost:8000/api/user/password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation
            });

            setSuccess('Password berhasil diperbarui!');
            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');

        } catch (err) {
            console.error(err);
            // Menangani error validasi dari server
            const errorMessage = err.response?.data?.message || 'Gagal memperbarui password. Periksa password lama Anda dan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Ubah Password</h3>
            
            {success && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg border border-green-200">{success}</div>}
            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <Key className="w-4 h-4 text-blue-600" /> Password Lama
                    </label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>
                <hr className="border-t border-gray-200" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-blue-600" /> Password Baru
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                    <p className="text-xs text-gray-500 mt-1 pl-1">Minimal 8 karakter.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-blue-600" /> Konfirmasi Password Baru
                    </label>
                    <input
                        type="password"
                        value={newPasswordConfirmation}
                        onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                        required
                        minLength={8}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Mengubah...' : <><Save className="w-5 h-5 mr-2" /> Ubah Password</>}
                </button>
            </form>
        </div>
    );
}
