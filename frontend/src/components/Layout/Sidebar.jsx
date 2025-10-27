import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Import icon Logout
import { useAuth } from '../../Context/AuthContext.jsx'; // Import AuthContext

const Sidebar = () => {
  const { logout } = useAuth(); // Ambil fungsi logout
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Arahkan ke halaman login setelah logout
  };
    
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manajemen Buku', path: '/admin/books' },
    { name: 'Manajemen Kategori', path: '/admin/categories' },
    { name: 'Manajemen Pesanan', path: '/admin/orders' },
  ];

  return (
    <div className="w-64 fixed h-full bg-gray-800 text-white shadow-2xl p-4 flex flex-col justify-between">
      <div>
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

        {/* Tombol Logout */}
        <div className="pb-4 border-t border-gray-700 pt-4">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center py-2 px-3 rounded transition duration-200 text-red-400 hover:bg-gray-700 hover:text-red-300"
            >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
            </button>
        </div>
    </div>
  );
};

export default Sidebar;