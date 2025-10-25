import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/authors';

export default function AuthorListPage() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL);
            setAuthors(response.data.data || response.data);
        } catch (err) {
            setError("Gagal mengambil data penulis.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus penulis ini?")) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchAuthors(); 
            } catch (err) {
                alert("Gagal menghapus penulis.");
            }
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manajemen Penulis</h1>
                <Link 
                    to="/admin/authors/create" 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    + Tambah Penulis
                </Link>
            </div>
            <table className="min-w-full bg-white border shadow">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="py-3 px-4 text-left">Nama Penulis</th>
                        <th className_="py-3 px-4 text-left">Bio (Singkat)</th>
                        <th className="py-3 px-4 text-left">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {authors.length > 0 ? authors.map((author) => (
                        <tr key={author.id}>
                            <td className="py-3 px-4">{author.name}</td>
                            <td className="py-3 px-4 truncate max-w-sm">{author.bio}</td>
                            <td className="py-3 px-4">
                                <Link 
                                    to={`/admin/authors/edit/${author.id}`}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(author.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="3" className="text-center py-4">Belum ada data.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}