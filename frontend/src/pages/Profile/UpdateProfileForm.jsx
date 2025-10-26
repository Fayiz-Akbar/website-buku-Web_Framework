import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Sesuaikan path AuthContext
import { User, Mail, Save } from 'lucide-react';

export default function UpdateProfileForm() {
    const { user, login } = useAuth(); // Kita pakai login untuk refresh user state
    
    // Asumsikan user memiliki full_name dan email
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Fallback URL, menggunakan pravatar dengan hash email user
    const profilePicUrl = user?.profile_picture_url || 'https://i.pravatar.cc/150?u=' + user?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Asumsi API endpoint: PUT /api/user/profile
            await axios.put('http://localhost:8000/api/user/profile', {
                full_name: fullName,
                // Kita tidak mengirim email karena dinonaktifkan di form, tetapi biarkan di sini jika backend membutuhkannya
                // email: email, 
            });

            setSuccess('Profil berhasil diperbarui!');
            // Idealnya, Anda memanggil fungsi refreshUser() di sini
            
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal memperbarui profil. Coba periksa data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg">
            <h3 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">Update Data Diri</h3>
            
            {success && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg border border-green-200">{success}</div>}
            {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">{error}</div>}

            <div className="flex flex-col items-center mb-6">
                <img 
                    src={profilePicUrl} 
                    alt="Foto Profil" 
                    className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-blue-200 shadow-md" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150/EEEEEE/888888?text=User" }}
                />
                <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition duration-150 mt-1">Ubah Foto (Fitur Upload Belum Tersedia)</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-blue-600" /> Nama Lengkap
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-blue-600" /> Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
                        disabled 
                    />
                    <p className="text-xs text-gray-500 mt-1 pl-1">Email tidak dapat diubah (Hubungi Admin).</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Perubahan</>}
                </button>
            </form>
        </div>
    );
}
