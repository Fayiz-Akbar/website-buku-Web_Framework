// frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// -- KOMPONEN LAYOUT & AUTH --
import AdminLayout from './components/Layout/AdminLayout';
import AuthGuard from './components/Layout/AuthGuard';
import GuestRoute from './components/Layout/GuestRoute';

// -- KOMPONEN PAGES --
import HomePage from './pages/HomePage';
import LoginPage from './pages/Shared/LoginPage';
import NotFoundPage from './pages/Shared/NotFoundPage';
import RegisterPage from './pages/Register/RegisterPage';

// --- HALAMAN ADMIN ---
import DashboardPage from './pages/DashboardPage';
import BookListPage from './pages/Books/BookListPage';
import BookFormPage from './pages/Books/BookFormPage';
import CategoryListPage from './pages/Categories/CategoryListPage';
import CategoryFormPage from './pages/Categories/CategoryFormPage';

// --- TAMBAHAN UNTUK AUTHOR & PUBLISHER ---
import AuthorListPage from './pages/Authors/AuthorListPage';
import AuthorFormPage from './pages/Authors/AuthorFormPage';
import PublisherListPage from './pages/Publishers/PublisherListPage';
import PublisherFormPage from './pages/Publishers/PublisherFormPage';
// ------------------------------------------

import OrderListPage from './pages/Orders/OrderListPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';


/**
 * Komponen Pembungkus untuk Rute Admin
 */
const AdminRoute = ({ element: Component }) => {
  return (
    <AuthGuard>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </AuthGuard>
  );
};

function App() {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/" element={<HomePage />} /> 
      <Route 
        path="/login" 
        element={<GuestRoute element={LoginPage} />}
      />

      {/* 2. Tambahkan route ini */}
    <Route path="/register" element={<RegisterPage />} /> 

    <Route path="/" element={<AdminLayout />}>
        {/* ... route lainnya ... */}
    </Route>

      {/* Rute Admin */}
      <Route path="/admin/dashboard" element={<AdminRoute element={DashboardPage} />} />
      
      {/* Rute Buku */}
      <Route path="/admin/books" element={<AdminRoute element={BookListPage} />} />
      <Route path="/admin/books/create" element={<AdminRoute element={BookFormPage} />} />
      <Route path="/admin/books/edit/:id" element={<AdminRoute element={BookFormPage} />} />
      
      {/* Rute Kategori */}
      <Route path="/admin/categories" element={<AdminRoute element={CategoryListPage} />} />
      <Route path="/admin/categories/create" element={<AdminRoute element={CategoryFormPage} />} />
      <Route path="/admin/categories/edit/:id" element={<AdminRoute element={CategoryFormPage} />} />

      {/* --- TAMBAHAN ROUTE AUTHOR & PUBLISHER --- */}
      <Route path="/admin/authors" element={<AdminRoute element={AuthorListPage} />} />
      <Route path="/admin/authors/create" element={<AdminRoute element={AuthorFormPage} />} />
      <Route path="/admin/authors/edit/:id" element={<AdminRoute element={AuthorFormPage} />} />
      
      <Route path="/admin/publishers" element={<AdminRoute element={PublisherListPage} />} />
      <Route path="/admin/publishers/create" element={<AdminRoute element={PublisherFormPage} />} />
      <Route path="/admin/publishers/edit/:id" element={<AdminRoute element={PublisherFormPage} />} />
      {/* ------------------------------------------ */}

      {/* Rute Pesanan */}
      <Route path="/admin/orders" element={<AdminRoute element={OrderListPage} />} />
      <Route path="/admin/orders/:id" element={<AdminRoute element={OrderDetailPage} />} />

      {/* Rute 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;