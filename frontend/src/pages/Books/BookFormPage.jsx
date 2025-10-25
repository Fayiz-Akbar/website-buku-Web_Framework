// frontend/src/pages/Books/BookFormPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// 1. Definisikan API URL
const API_URL = 'http://localhost:8000/api/admin';

const BookFormPage = () => {
    // 2. Siapkan hooks
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // 3. State untuk data dropdown/checkbox
    const [allCategories, setAllCategories] = useState([]);
    const [allAuthors, setAllAuthors] = useState([]);
    const [allPublishers, setAllPublishers] = useState([]);

    // 4. State untuk semua data form
    const [formData, setFormData] = useState({
        title: '',
        publisher_id: '',
        isbn: '',
        description: '',
        page_count: '',
        published_year: '',
        price: '',
        stock: '',
        cover_image_url: '',
        author_ids: [], // Untuk checkbox many-to-many
        category_ids: [], // Untuk checkbox many-to-many
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 5. useEffect untuk mengambil data dropdown (Kategori, Penulis, Publisher)
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [catRes, authRes, pubRes] = await Promise.all([
                    axios.get(`${API_URL}/categories`),
                    axios.get(`${API_URL}/authors`),
                    axios.get(`${API_URL}/publishers`),
                ]);
                setAllCategories(catRes.data.data || catRes.data);
                setAllAuthors(authRes.data.data || authRes.data);
                setAllPublishers(pubRes.data.data || pubRes.data);
            } catch (err) {
                setError("Gagal memuat data pendukung.");
            }
        };
        fetchDropdownData();
    }, []);

    // 6. useEffect untuk mengambil data buku (jika mode Edit)
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            axios.get(`${API_URL}/books/${id}`)
                .then(response => {
                    const book = response.data.data; // Data ada di .data
                    setFormData({
                        title: book.title || '',
                        publisher_id: book.publisher?.id || '',
                        isbn: book.isbn || '',
                        description: book.description || '',
                        page_count: book.page_count || '',
                        published_year: book.published_year || '',
                        price: book.price || '',
                        stock: book.stock || '',
                        cover_image_url: book.cover_image_url || '',
                        // Ambil array ID dari relasi
                        author_ids: book.authors.map(a => a.id),
                        category_ids: book.categories.map(c => c.id),
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setError("Gagal mengambil data buku.");
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    // 7. Handler untuk input biasa
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 8. Handler untuk checkbox (many-to-many)
    const handleCheckboxChange = (e, type) => {
        const { value, checked } = e.target;
        const id = parseInt(value);
        
        setFormData(prev => {
            const currentIds = prev[type]; // cth: prev.author_ids
            if (checked) {
                return { ...prev, [type]: [...currentIds, id] };
            } else {
                return { ...prev, [type]: currentIds.filter(item => item !== id) };
            }
        });
    };

    // 9. Handler untuk submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = { ...formData }; // Kirim JSON biasa

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/books/${id}`, payload);
            } else {
                await axios.post(`${API_URL}/books`, payload);
            }
            navigate('/admin/books'); // Kembali ke list buku
        } catch (err) {
            // Tangani error validasi dari Laravel
            if (err.response && err.response.data.errors) {
                const validationErrors = Object.values(err.response.data.errors).flat().join('\n');
                setError(validationErrors);
            } else {
                setError("Gagal menyimpan data.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Tampilkan loading jika sedang mengambil data untuk mode edit
    if (loading && isEditMode) return <div className="p-6 text-center">Loading data...</div>;

    // 10. Render Form Lengkap
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
                {isEditMode ? 'Edit Buku' : 'Tambah Buku Baru'}
            </h1>
            
            <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow-lg">
                {/* Tampilkan error jika ada */}
                {error && <pre className="bg-red-100 text-red-700 p-3 mb-4 rounded whitespace-pre-wrap">{error}</pre>}
                
                {/* Input Teks */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Judul</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">ISBN</label>
                    <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Cover Image (URL)</label>
                    <input type="text" name="cover_image_url" value={formData.cover_image_url} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://..." />
                </div>
                
                {/* Grid untuk Angka */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Jumlah Halaman</label>
                        <input type="number" name="page_count" value={formData.page_count} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Tahun Terbit</label>
                        <input type="number" name="published_year" value={formData.published_year} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Harga</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">Stok</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                </div>
                
                {/* Dropdown Publisher (One-to-Many) */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Penerbit</label>
                    <select name="publisher_id" value={formData.publisher_id} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="">Pilih Penerbit</option>
                        {allPublishers.map(pub => <option key={pub.id} value={pub.id}>{pub.name}</option>)}
                    </select>
                </div>
                
                {/* Checkbox Authors (Many-to-Many) */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Penulis</label>
                    <div className="grid grid-cols-3 gap-2 border p-2 rounded max-h-40 overflow-y-auto">
                        {allAuthors.map(author => (
                            <label key={author.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={author.id}
                                    checked={formData.author_ids.includes(author.id)}
                                    onChange={(e) => handleCheckboxChange(e, 'author_ids')}
                                />
                                <span>{author.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Checkbox Categories (Many-to-Many) */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Kategori</label>
                    <div className="grid grid-cols-3 gap-2 border p-2 rounded max-h-40 overflow-y-auto">
                        {allCategories.map(cat => (
                            <label key={cat.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={cat.id}
                                    checked={formData.category_ids.includes(cat.id)}
                                    onChange={(e) => handleCheckboxChange(e, 'category_ids')}
                                />
                                <span>{cat.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* Textarea Deskripsi */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Deskripsi</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows="4"></textarea>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center">
                    <button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow">
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/books')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow ml-2">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookFormPage;