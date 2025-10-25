import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/publishers';

export default function PublisherFormPage() {
    const [name, setName] = useState('');
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
                    setName(response.data.name);
                    setLoading(false);
                })
                .catch(err => {
                    setError("Gagal mengambil data penerbit.");
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const publisherData = { name }; 

        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/${id}`, publisherData);
            } else {
                await axios.post(API_URL, publisherData);
            }
            navigate('/admin/publishers');
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
                {isEditMode ? 'Edit Penerbit' : 'Tambah Penerbit Baru'}
            </h1>
            
            <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow">
                {error && <pre className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</pre>}
                
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                        Nama Penerbit
                    </label>
                    <input
                        type="text" id="name" name="name"
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded" required
                    />
                </div>
                
                <div className="flex items-center">
                    <button type="submit" disabled={loading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin/publishers')} className="bg-gray-500 text-white font-bold py-2 px-4 rounded ml-2">
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}