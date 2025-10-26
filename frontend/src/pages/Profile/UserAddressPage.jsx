import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Plus, Trash2, Edit, CheckCircle, Loader2 } from 'lucide-react';
// --- IMPORT FILE FORM BARU ---
import AddressForm from './AddressForm.jsx'; 

const API_URL = 'http://localhost:8000/api/user/addresses';

// --- Komponen Baris Alamat ---
function AddressItem({ address, fetchAddresses, openEditModal }) {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    
    // Asumsi user_id ada di token atau context
    const userId = user?.id; 

    const handleSetPrimary = async () => {
        setLoading(true);
        try {
            // Asumsi API endpoint untuk mengubah status utama: PUT /api/user/addresses/{id}/primary
            // Endpoint ini biasanya hanya membutuhkan ID alamat di URL, dan User ID diambil dari Auth Token
            await axios.put(`${API_URL}/${address.id}/primary`, { user_id: userId });
            fetchAddresses(); // Refresh data
        } catch (error) {
            window.alert("Gagal menetapkan alamat utama. Coba lagi.");
            console.error("Gagal menetapkan alamat utama:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Yakin ingin menghapus alamat "${address.address_label}"?`)) return; 
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/${address.id}`);
            fetchAddresses(); // Refresh data
        } catch (error) {
            window.alert("Gagal menghapus alamat. Coba lagi.");
            console.error("Gagal menghapus alamat:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-gray-200 p-4 rounded-lg shadow-sm mb-4 bg-white relative">
            {address.is_primary && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Utama
                </div>
            )}
            <h4 className="font-bold text-lg mb-2">{address.recipient_name} ({address.address_label})</h4>
            
            {/* Detail Penerima */}
            <p className="text-gray-800 font-medium">Telp: {address.phone_number}</p>
            
            {/* Detail Alamat */}
            <p className="text-gray-600 text-sm mt-1">{address.address_line}</p>
            <p className="text-gray-600 text-sm">{address.city}, {address.province}, {address.postal_code}</p>

            <div className="mt-3 flex space-x-3 text-sm">
                {!address.is_primary && (
                    <button 
                        onClick={handleSetPrimary} 
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Jadikan Utama'}
                    </button>
                )}
                <button 
                    onClick={() => openEditModal(address)} // Tombol Edit membuka modal
                    className="flex items-center text-gray-500 hover:text-gray-700"
                >
                     <Edit className="w-4 h-4 mr-1" /> Edit
                </button>
                <button onClick={handleDelete} disabled={loading} className="flex items-center text-red-500 hover:text-red-700 disabled:opacity-50">
                    {loading ? 'Hapus...' : <><Trash2 className="w-4 h-4 mr-1" /> Hapus</>}
                </button>
            </div>
        </div>
    );
}

// --- Komponen Halaman Utama Manajemen Alamat ---
export default function UserAddressPage() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isLoggedIn } = useAuth();
    
    // State untuk Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null); // Data alamat yang akan diedit

    const fetchAddresses = async () => {
        if (!isLoggedIn) return;
        setLoading(true);
        setError('');
        try {
            // Asumsi API endpoint: GET /api/user/addresses
            const response = await axios.get(API_URL);
            setAddresses(response.data.data || []);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat daftar alamat. Pastikan Anda sudah login.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [isLoggedIn]);

    // Fungsi untuk membuka modal Tambah
    const openAddModal = () => {
        setAddressToEdit(null); // Pastikan null untuk mode tambah
        setIsModalOpen(true);
    };

    // Fungsi untuk membuka modal Edit
    const openEditModal = (address) => {
        setAddressToEdit(address);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setIsModalOpen(false);
        setAddressToEdit(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-600" /> Kelola Alamat Pengiriman
                </h3>
                <button 
                    onClick={openAddModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-1" /> Tambah Alamat Baru
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}
            {error && <div className="p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

            {!loading && addresses.length === 0 && (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                    <p className="text-lg text-gray-500">Anda belum memiliki alamat tersimpan.</p>
                </div>
            )}

            {!loading && addresses.length > 0 && (
                <div>
                    {addresses.map(address => (
                        <AddressItem 
                            key={address.id} 
                            address={address} 
                            fetchAddresses={fetchAddresses} 
                            openEditModal={openEditModal} // Kirim fungsi edit
                        />
                    ))}
                </div>
            )}

            {/* --- MODAL FORM ALAMAT --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <AddressForm 
                            currentAddress={addressToEdit}
                            fetchAddresses={fetchAddresses}
                            closeModal={closeModal}
                        />
                    </div>
                </div>
            )}
            {/* --- AKHIR MODAL --- */}

        </div>
    );
}
