import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Sesuaikan URL API jika port Anda berbeda
const API_URL = 'http://localhost:8000/api/admin/categories';

export default function CategoryFormPage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate(); 
    const { id } = useParams(); // Ambil ID dari URL
    const isEditMode = Boolean(id); // Cek apakah ini mode Edit

    useEffect(() => {
        // Jika mode edit, ambil data kategori yang mau di-edit
        if (isEditMode) {
            setLoading(true);
            axios.get(`${API_URL}/${id}`)
                .then(response => {
                    setName(response.data.name); // Asumsi 'data' bukan 'data.data'
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching category:", err);
                    setError("Gagal mengambil data kategori.");
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Kita hanya kirim 'name'. 'slug' akan dibuat otomatis oleh backend.
        const categoryData = { name }; 

        try {
            if (isEditMode) {
                // Logika UPDATE (PUT)
                await axios.put(`${API_URL}/${id}`, categoryData);
            } else {
                // Logika CREATE (POST)
                await axios.post(API_URL, categoryData);
            }
            
            // Jika berhasil, kembali ke halaman list
            navigate('/admin/categories');

        } catch (err) {
            console.error("Error saving category:", err);
            if (err.response && err.response.data.errors && err.response.data.errors.name) {
                // Menampilkan error validasi 'name' dari Laravel
                setError(err.response.data.errors.name[0]);
            } else {
                setError("Gagal menyimpan data.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div>Loading data...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h1>
            
            <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
                {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
                
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                        Nama Kategori
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>
                
                <div className="flex items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/categories')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}