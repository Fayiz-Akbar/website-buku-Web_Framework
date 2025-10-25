import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/authors';

export default function AuthorFormPage() {
    const [formData, setFormData] = useState({ name: '', bio: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate(); 
    const { id } = useParams();
    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            axios.get(`${API_URL}/${id}`)
                .then(response => {
                    setFormData({
                        name: response.data.name,
                        bio: response.data.bio || ''
                    });
                    setLoading(false);
                })
                .catch(err => {
                    setError("Gagal mengambil data penulis.");
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const authorData = formData; 

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/${id}`, authorData);
            } else {
                await axios.post(API_URL, authorData);
            }
            navigate('/admin/authors');
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setError(Object.values(err.response.data.errors).flat().join('\n'));
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
                {isEditMode ? 'Edit Penulis' : 'Tambah Penulis Baru'}
            </h1>
            
            <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
                {error && <pre className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</pre>}
                
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                        Nama Penulis
                    </label>
                    <input
                        type="text" id="name" name="name"
                        value={formData.name} onChange={handleChange}
                        className="w-full p-2 border rounded" required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="bio" className="block text-gray-700 font-bold mb-2">
                        Biografi
                    </label>
                    <textarea
                        id="bio" name="bio"
                        value={formData.bio} onChange={handleChange}
                        className="w-full p-2 border rounded" rows="4"
                    />
                </div>
                
                <div className="flex items-center">
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/authors')} className="bg-gray-500 text-white font-bold py-2 px-4 rounded ml-2">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}