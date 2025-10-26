import React, { useState, useEffect } from 'react';
// FIX: Ganti 'axios' dengan 'apiAuth'
import { apiAuth } from '../../api/axios.js'; 
import { MapPin, User, Phone, Globe, Save, X } from 'lucide-react';

// FIX: Gunakan ENDPOINT relatif, apiAuth sudah menangani base URL
const API_ENDPOINT = '/user/addresses'; 

export default function AddressForm({ currentAddress, fetchAddresses, closeModal }) {
    const isEdit = !!currentAddress; // True jika mode edit
    
    // State form
    const [form, setForm] = useState({
        address_label: currentAddress?.address_label || '',
        recipient_name: currentAddress?.recipient_name || '',
        phone_number: currentAddress?.phone_number || '',
        address_line: currentAddress?.address_line || '',
        city: currentAddress?.city || '',
        province: currentAddress?.province || '',
        postal_code: currentAddress?.postal_code || '',
        // is_primary tidak perlu di-set jika edit/add. Server akan menangani primary.
        is_primary: currentAddress?.is_primary || false, 
    });
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const method = isEdit ? 'put' : 'post';
        // FIX: URL menggunakan ENDPOINT
        const url = isEdit ? `${API_ENDPOINT}/${currentAddress.id}` : API_ENDPOINT;

        try {
            // FIX: Gunakan apiAuth untuk otorisasi
            await apiAuth[method](url, form); 
            closeModal(); // Tutup modal setelah sukses
            fetchAddresses(); // Refresh daftar alamat
        } catch (err) {
            console.error("Gagal menyimpan alamat:", err);
            // Tangani error validasi dari Laravel
            const apiError = err.response?.data?.errors || err.response?.data?.message || 'Gagal menyimpan alamat. Periksa input.';
            
            if (typeof apiError === 'object') {
                 // Jika error adalah objek validasi (Laravel standard)
                const firstError = Object.values(apiError)[0][0];
                setError(firstError);
            } else {
                setError(apiError);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">
                {isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </h3>
            
            {error && <div className="p-3 text-red-700 bg-red-100 rounded">{error}</div>}

            {/* Label Alamat */}
            <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Label Alamat (Contoh: Rumah, Kantor)
                </label>
                <input
                    type="text"
                    name="address_label"
                    value={form.address_label}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            {/* Nama Penerima & Telepon */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <User className="w-4 h-4" /> Nama Penerima
                    </label>
                    <input
                        type="text"
                        name="recipient_name"
                        value={form.recipient_name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Phone className="w-4 h-4" /> Nomor Telepon
                    </label>
                    <input
                        type="text"
                        name="phone_number"
                        value={form.phone_number}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
            </div>

            {/* Alamat Baris */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Alamat Lengkap
                </label>
                <textarea
                    name="address_line"
                    value={form.address_line}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            
            {/* Kota, Provinsi, Kode Pos */}
            <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Kota</label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                    <input type="text" name="province" value={form.province} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                    <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>

            {/* Checkbox Utama */}
            <div className="flex items-center">
                <input
                    id="is_primary"
                    name="is_primary"
                    type="checkbox"
                    checked={form.is_primary}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
                    Jadikan Alamat Utama
                </label>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <X className="w-4 h-4 mr-2" /> Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Alamat</>}
                </button>
            </div>
        </form>
    );
}