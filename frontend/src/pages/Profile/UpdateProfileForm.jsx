import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { User, Mail, Save, MapPin, ImagePlus } from 'lucide-react';

export default function UpdateProfileForm() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(
    user?.profile_picture_url || 'https://i.pravatar.cc/150?u=' + user?.email
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('address', address);
      if (selectedImage) {
        formData.append('profile_picture', selectedImage);
      }

      // 🔧 gunakan endpoint yang benar (PUT dan tanpa /update)
      const response = await axios.put(
        'http://localhost:8000/api/user/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

  setSuccess('Profil berhasil diperbarui!');
  // Perbarui context user tanpa memicu proses login
  updateUser(response.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memperbarui profil. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">
        Update Data Diri
      </h3>

      {success && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-lg border border-green-200">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center mb-6">
        <img
          src={preview}
          alt="Foto Profil"
          className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-blue-200 shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/150x150/EEEEEE/888888?text=User';
          }}
        />

        <label className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
          <ImagePlus className="w-4 h-4" />
          <span>Ubah Foto</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
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
            disabled
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1 pl-1">
            Email tidak dapat diubah (Hubungi Admin).
          </p>
        </div>

        {/* 🆕 Input Alamat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" /> Alamat
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap Anda"
            rows="3"
            className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Menyimpan...'
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> Simpan Perubahan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
