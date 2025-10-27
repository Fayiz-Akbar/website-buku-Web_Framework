import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Book, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext.jsx';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manajemen Buku', path: '/admin/books', icon: Book },
    { name: 'Manajemen Pesanan', path: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full w-64 bg-slate-900 text-slate-100 border-r border-slate-800 transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      role="navigation"
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-lg font-semibold text-white">Admin</div>
          <p className="text-xs text-slate-400">Panel administrasi</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isActive ? 'bg-slate-800/60 text-white ring-1 ring-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'}`
                    }
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm text-red-300 hover:text-white hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;