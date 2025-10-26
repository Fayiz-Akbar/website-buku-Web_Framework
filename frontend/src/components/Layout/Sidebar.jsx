// frontend/src/components/Layout/Sidebar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  console.log("Sidebar component is rendering!");
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manajemen Buku', path: '/admin/books' },
    { name: 'Manajemen Kategori', path: '/admin/categories' },
    { name: 'Manajemen Pesanan', path: '/admin/orders' },
  ];

  return (
    <div className="w-64 fixed h-full bg-gray-800 text-white shadow-xl p-4">
      <h1 className="text-2xl font-semibold mb-8 text-blue-400 border-b border-gray-700 pb-4">
        Admin Toko Buku
      </h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `block py-2 px-3 rounded transition duration-200 ${
                    isActive ? 'bg-blue-600 font-bold' : 'hover:bg-gray-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;