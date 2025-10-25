import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import AdminLayout from './components/Layout/AdminLayout'; // Layout Admin Anda
import UserLayout from './components/Layout/UserLayout';   // Layout User BARU Anda

// Routes
import AuthGuard from './components/Layout/AuthGuard';     // Pelindung route admin
import GuestRoute from './components/Layout/GuestRoute';   // Pelindung route login/register

// Halaman Publik / User
import HomePage from './pages/HomePage';
import LoginPage from './pages/Shared/LoginPage';       // Sesuaikan path jika beda
import RegisterPage from './pages/Register/RegisterPage'; // Sesuaikan path jika beda
// import BookDetailPage from './pages/BookDetailPage'; // (Contoh halaman detail)
// import CartPage from './pages/CartPage';         // (Contoh halaman keranjang)

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
      {/* Rute Tamu (Login & Register) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Rute Publik / User (Menggunakan UserLayout BARU) */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        {/* Tambahkan rute user lain di sini */}
        {/* <Route path="/books/:id" element={<BookDetailPage />} /> */}
        {/* <Route path="/cart" element={<CartPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
      </Route>

      {/* Rute Admin (Menggunakan AdminLayout LAMA Anda) */}
      <Route 
        path="/" 
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin/books" element={<BookListPage />} />
        <Route path="admin/books/new" element={<BookFormPage />} />
        <Route path="admin/books/edit/:id" element={<BookFormPage />} />
        
        <Route path="admin/categories" element={<CategoryListPage />} />
        <Route path="admin/categories/new" element={<CategoryFormPage />} />
        <Route path="admin/categories/edit/:id" element={<CategoryFormPage />} />
        
        <Route path="admin/authors" element={<AuthorListPage />} />
        <Route path="admin/authors/new" element={<AuthorFormPage />} />
        <Route path="admin/authors/edit/:id" element={<AuthorFormPage />} />
        
        <Route path="admin/publishers" element={<PublisherListPage />} />
        <Route path="admin/publishers/new" element={<PublisherFormPage />} />
        <Route path="admin/publishers/edit/:id" element={<PublisherFormPage />} />
        
        <Route path="admin/orders" element={<OrderListPage />} />
        <Route path="admin/orders/:id" element={<OrderDetailPage />} />
      </Route>

    </Routes>
  );
}

export default App;