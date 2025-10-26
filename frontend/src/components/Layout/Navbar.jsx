// frontend/src/components/Layout/Navbar.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Sesuaikan path jika perlu
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout, user } = useAuth(); // Ambil 'logout' dan 'user' dari context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();          // Panggil fungsi logout dari AuthContext
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md flex justify-between items-center px-6 z-10">
      <h3 className="text-xl font-medium text-gray-700">Dashboard Panel</h3>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Halo, Admin!</span>
        <img
          src={user?.avatar_url || user?.avatar || "/default-avatar.png"}
          alt="avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded transition duration-150"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;