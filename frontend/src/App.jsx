import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';
import UserLayout from './components/Layout/UserLayout';

// Routes
import AuthGuard from './components/Layout/AuthGuard';
import GuestRoute from './components/Layout/GuestRoute';

// Halaman Publik / User
import HomePage from './pages/HomePage';
import LoginPage from './pages/Shared/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import BookCatalogPage from './pages/BookCatalogPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
// --- IMPORT BARU ---
import WishlistPage from './pages/WishlistPage.jsx'; 
import NotFoundPage from './pages/Shared/NotFoundPage';

// Halaman Admin
import DashboardPage from './pages/DashboardPage';
import BookListPage from './pages/Books/BookListPage';
import BookFormPage from './pages/Books/BookFormPage';
import CategoryListPage from './pages/Categories/CategoryListPage';
import CategoryFormPage from './pages/Categories/CategoryFormPage';
import AuthorListPage from './pages/Authors/AuthorListPage';
import AuthorFormPage from './pages/Authors/AuthorFormPage';
import PublisherListPage from './pages/Publishers/PublisherListPage';
import PublisherFormPage from './pages/Publishers/PublisherFormPage';
import OrderListPage from './pages/Orders/OrderListPage';
import OrderDetailPage from './pages/Orders/OrderDetailPage';


function App() {
  return (
    <Routes>
      {/* Rute Tamu (Sudah Benar) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Rute User (Sudah Benar) */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="books" element={<BookCatalogPage />} /> 
        <Route path="books/:id" element={<BookDetailPage />} />
        <Route path="wishlist" element={<WishlistPage />} /> 
      </Route>

      {/* --- RUTE ADMIN (DIPERBAIKI) --- */}
      {/* 1. Bungkus SEMUA rute admin dengan AuthGuard */}
      <Route element={<AuthGuard />}> 
        {/* 2. Gunakan AdminLayout SEBAGAI layout route untuk prefix /admin */}
        <Route path="/admin" element={<AdminLayout />}> 
          {/* 3. Definisikan rute admin RELATIF terhadap /admin */}
          {/* Path kosong atau 'index' untuk /admin */}
          <Route index element={<DashboardPage />} /> 
          <Route path="dashboard" element={<DashboardPage />} /> 
          
          <Route path="books" element={<BookListPage />} />
          <Route path="books/create" element={<BookFormPage />} /> 
          <Route path="books/edit/:id" element={<BookFormPage />} />
          
          <Route path="categories" element={<CategoryListPage />} />
          <Route path="categories/create" element={<CategoryFormPage />} /> 
          <Route path="categories/edit/:id" element={<CategoryFormPage />} />
          
          <Route path="authors" element={<AuthorListPage />} />
          <Route path="authors/create" element={<AuthorFormPage />} /> 
          <Route path="authors/edit/:id" element={<AuthorFormPage />} />
          
          <Route path="publishers" element={<PublisherListPage />} />
          <Route path="publishers/create" element={<PublisherFormPage />} /> 
          <Route path="publishers/edit/:id" element={<PublisherFormPage />} />
          
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route> 
      </Route> 
      {/* --- AKHIR RUTE ADMIN --- */}

      {/* Rute 404 (Opsional, letakkan di luar guard jika perlu) */}
      <Route path="*" element={<NotFoundPage />} /> 
    </Routes>
  );
}

export default App;