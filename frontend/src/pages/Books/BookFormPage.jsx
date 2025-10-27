// File: frontend/src/pages/Books/BookFormPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link
// FIX KRITIS: Import apiAuth untuk otorisasi Admin (Sesuaikan path jika perlu)
import { apiAuth } from '../../api/axios'; 
// FIX KRITIS: Import SEMUA icon yang digunakan
import { Loader2, Plus, Edit, BookOpen, User, Tag, Home, DollarSign, Package, Save, AlertCircle } from 'lucide-react'; 
import { toast } from 'react-toastify';

// ENDPOINT API
const BOOK_ENDPOINT = '/admin/books';
const CATEGORIES_ENDPOINT = '/admin/categories';
const AUTHORS_ENDPOINT = '/admin/authors';
const PUBLISHERS_ENDPOINT = '/admin/publishers';

export default function BookFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        stock: '',
        description: '',
        publisher_id: '',
        cover_image: null, // File upload
        cover_image_url: '', // Text URL
        authors: [],
        categories: [],
    });

    const [formError, setFormError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data Relasi
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loadingRelations, setLoadingRelations] = useState(true);

    // Helper aman untuk ambil array dari berbagai bentuk respons API
    const pickList = (res) => {
      const d = res?.data;
      return (
        d?.data?.data || // { data: { data: [...] , meta... } }
        d?.data ||       // { data: [...] }
        d ||             // [...]
        []
      );
    };

    // --- FETCH DATA RELASI (CATEGORIES, AUTHORS, PUBLISHERS) ---
    const fetchRelations = async () => {
        setLoadingRelations(true);
        try {
            const [catRes, authRes, pubRes] = await Promise.all([
                apiAuth.get(CATEGORIES_ENDPOINT, { params: { all: true, per_page: 1000 } }),
                apiAuth.get(AUTHORS_ENDPOINT,    { params: { all: true, per_page: 1000 } }),
                apiAuth.get(PUBLISHERS_ENDPOINT, { params: { all: true, per_page: 1000 } }),
            ]);

            setCategories(pickList(catRes));
            setAuthors(pickList(authRes));
            setPublishers(pickList(pubRes));
        } catch (err) {
            console.error("Failed to fetch relations:", err?.response || err);
            toast.error("Gagal memuat data relasi. Pastikan Anda login dan endpoint tersedia.");
        } finally {
            setLoadingRelations(false);
        }
    };

    // --- FETCH DATA BUKU JIKA EDIT ---
    const fetchBook = async () => {
        setLoading(true);
        try {
            // Menggunakan apiAuth untuk GET detail buku
            const response = await apiAuth.get(`/books/${id}`);
            const bookData = response.data.data;

            setFormData({
                title: bookData.title || '',
                price: bookData.price || '',
                stock: bookData.stock || '',
                description: bookData.description || '',
                publisher_id: bookData.publisher?.id || '',
                cover_image: null,
                cover_image_url: bookData.cover_url || '',
                authors: bookData.authors?.map(a => a.id) || [],
                categories: bookData.categories?.map(c => c.id) || [],
            });
        } catch (err) {
            console.error("Failed to fetch book data:", err);
            toast.error("Gagal memuat data buku untuk edit.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelations();
        if (isEdit) {
            fetchBook();
        }
    }, [isEdit, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            cover_image: e.target.files[0]
        }));
    };
    
    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        const apiMethod = isEdit ? 'post' : 'post'; // Menggunakan POST untuk multipart/form-data
        const apiUrl = isEdit ? `${BOOK_ENDPOINT}/${id}?_method=PUT` : BOOK_ENDPOINT; // Spoofing PUT/PATCH

        // Mempersiapkan FormData untuk file dan data relasi
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'authors' || key === 'categories') {
                // Menangani array untuk Laravel
                formData[key].forEach(val => data.append(`${key}[]`, val));
            } else if (key === 'cover_image' && formData[key]) {
                data.append(key, formData[key]);
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });
        
        // Hapus cover_image_url jika ada file upload baru
        if (formData.cover_image) {
            data.delete('cover_image_url');
        }


        try {
            // FIX KRITIS: Menggunakan apiAuth
            await apiAuth({
                method: apiMethod,
                url: apiUrl,
                data: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(`Buku berhasil di-${isEdit ? 'perbarui' : 'tambahkan'}!`);
            navigate('/admin/books');
        } catch (err) {
            console.error("Submission failed:", err.response);
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join('; ')
                : (err.response?.data?.message || 'Gagal menyimpan data buku.');
            setFormError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingRelations || loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    }

    // --- Tampilan Form (Perbaikan UI/UX) ---
    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg border">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
                <span className='mr-2'>{isEdit ? <Edit className="inline w-7 h-7" /> : <Plus className="inline w-7 h-7" />}</span>
                {isEdit ? `Edit Buku: ${formData.title}` : 'Tambah Buku Baru'}
            </h1>
            
            {formError && (
                <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Judul & Deskripsi */}
                <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Detail Dasar</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Judul Buku</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Harga & Stok & Penerbit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Harga */}
                    <div className="p-4 border rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><DollarSign className="w-4 h-4"/> Harga (Rp)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="any"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Stok */}
                    <div className="p-4 border rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><Package className="w-4 h-4"/> Stok</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    
                    {/* Penerbit */}
                    <div className="p-4 border rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><Home className="w-4 h-4"/> Penerbit</label>
                        <select
                            name="publisher_id"
                            value={formData.publisher_id}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="">-- Pilih Penerbit --</option>
                            {/* FIX: Pastikan publishers array diisi dari fetchRelations */}
                            {publishers.map(pub => (
                                <option key={pub.id} value={pub.id}>{pub.name}</option>
                            ))}
                        </select>
                        {/* FIX: Link CRUD Penerbit */}
                        <Link to="/admin/publishers/new" className="text-xs text-blue-500 hover:underline mt-1 block">
                            + Tambah Penerbit Baru
                        </Link>
                    </div>

                </div>

                {/* Cover Image & URL */}
                 <div className="p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">Cover Gambar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Upload File */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Upload Gambar (JPG, PNG)</label>
                            <input
                                type="file"
                                name="cover_image_file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        
                         {/* URL Gambar (Hanya jika tidak ada file) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Atau URL Gambar Eksternal</label>
                            <input
                                type="url"
                                name="cover_image_url"
                                value={formData.cover_image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/cover.jpg"
                                disabled={!!formData.cover_image}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-200"
                            />
                        </div>
                    </div>
                    {isEdit && formData.cover_image_url && !formData.cover_image && (
                         <div className='mt-4'>
                            <p className="text-xs text-gray-500">Gambar saat ini:</p>
                            <img src={formData.cover_image_url} alt="Cover Preview" className="h-24 w-auto object-cover rounded mt-1 border" />
                         </div>
                    )}
                </div>

                {/* Relasi (Penulis & Kategori) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50">
                    
                    {/* Penulis (Multiple Select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><User className="w-4 h-4"/> Penulis (Pilih Satu atau Lebih)</label>
                        <select
                            multiple
                            name="authors"
                            value={formData.authors}
                            onChange={handleMultiSelectChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 h-32 bg-white"
                        >
                            {authors.map(author => (
                                <option key={author.id} value={author.id}>{author.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Tahan Ctrl/Command untuk memilih lebih dari satu.</p>
                        {/* FIX: Link CRUD Penulis */}
                        <Link to="/admin/authors/new" className="text-xs text-blue-500 hover:underline mt-1 block">
                            + Tambah Penulis Baru
                        </Link>
                    </div>
                    
                    {/* Kategori (Multiple Select) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><Tag className="w-4 h-4"/> Kategori (Pilih Satu atau Lebih)</label>
                        <select
                            multiple
                            name="categories"
                            value={formData.categories}
                            onChange={handleMultiSelectChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 h-32 bg-white"
                        >
                             {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Tahan Ctrl/Command untuk memilih lebih dari satu.</p>
                        {/* FIX: Link CRUD Kategori */}
                        <Link to="/admin/categories/new" className="text-xs text-blue-500 hover:underline mt-1 block">
                            + Tambah Kategori Baru
                        </Link>
                    </div>
                    
                </div>


                {/* Tombol Submit */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || loadingRelations || loading}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                        {isEdit ? 'Perbarui Buku' : 'Tambah Buku'}
                    </button>
                </div>
            </form>
        </div>
    );
}