// Di dalam file CategoryListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Pastikan sudah import axios (dan base URL/interceptor sudah di-set)

// Tentukan API URL
const API_URL = 'http://localhost:8000/api/admin/categories'; // Sesuaikan port

export default function CategoryListPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fungsi untuk mengambil data dari API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Kita butuh token, pastikan axios interceptor (di AuthContext) sudah
            // otomatis menyisipkan header Authorization: Bearer {token}
            const response = await axios.get(API_URL);
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("Gagal mengambil data kategori.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Ambil data saat komponen pertama kali di-load
    useEffect(() => {
        fetchCategories();
    }, []);

    // 3. Fungsi untuk menghapus data
    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                // Refresh data setelah berhasil hapus
                fetchCategories(); 
            } catch (err) {
                console.error("Error deleting category:", err);
                alert("Gagal menghapus kategori.");
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manajemen Kategori</h1>
                <Link 
                    to="/admin/categories/create" // Kita akan buat route ini nanti
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    + Tambah Kategori
                </Link>
            </div>

            {/* 4. Tabel untuk menampilkan data */}
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Nama Kategori</th>
                        <th className="py-2 px-4 border-b text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <tr key={category.id}>
                                <td className="py-2 px-4 border-b">{category.name}</td>
                                <td className="py-2 px-4 border-b">
                                    <Link 
                                        to={`/admin/categories/edit/${category.id}`} // Route untuk edit
                                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" className="py-4 px-4 text-center">
                                Belum ada data kategori.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}