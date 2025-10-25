// frontend/src/components/Layout/Navbar.jsx

import React from 'react';

const Navbar = () => {
  const handleLogout = () => {
    // TODO: Tambahkan logika logout (menghapus token dan redirect ke /login)
    alert('Log out...'); 
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow-md flex justify-between items-center px-6 z-10">
      <h3 className="text-xl font-medium text-gray-700">Dashboard Panel</h3>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Halo, Admin!</span>
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