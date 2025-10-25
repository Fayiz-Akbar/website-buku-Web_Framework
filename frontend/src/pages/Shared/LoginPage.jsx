// Di dalam file LoginPage.jsx

import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await login(email, password);
            
            // Cek role setelah login berhasil
            if (user.role === 'admin') {
                navigate('/dashboard'); // Arahkan ke dashboard jika admin
            } else {
                navigate('/'); // Arahkan ke homepage jika bukan admin
            }

        } catch (err) {
            setError('Email atau password salah. Silakan coba lagi.');
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded">
                <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <div className="mb-4">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}