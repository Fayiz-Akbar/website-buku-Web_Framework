// File: frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// (Impor provider dan halaman Anda tetap sama)
import { AuthProvider } from './Context/AuthContext'; 
import { CartProvider } from './Context/CartContext';
import AdminLayout from './components/Layout/AdminLayout';
import UserLayout from './components/Layout/UserLayout';
import { WishlistProvider } from './Context/WishlistContext';
import AuthGuard from './components/Layout/AuthGuard';
import GuestRoute from './components/Layout/GuestRoute';
import { AdminGuard } from './components/Layout/AdminGuard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Shared/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import BookCatalogPage from './pages/BookCatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import CartPage from './pages/CartPage';
import CategoryBooksPage from "./pages/Categories/CategoryBooksPage";
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
import NotFoundPage from './pages/Shared/NotFoundPage';


function App() {
  return (
      <Routes>
        {/* Rute Tamu (Login, Register) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- STRUKTUR BARU DI BAWAH INI --- */}

        {/* Rute yang membutuhkan LOGIN (Dibungkus AuthGuard) */}
        <Route element={<AuthGuard />}>
          
          {/* Rute USER yang butuh login (Dibungkus UserLayout) */}
          <Route element={<UserLayout />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile/*" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Rute ADMIN (Dibungkus AdminGuard, lalu AdminLayout) */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/books" element={<BookListPage />} />
              <Route path="/admin/books/new" element={<BookFormPage />} />
              <Route path="/admin/books/create" element={<BookFormPage />} />
              <Route path="/admin/books/edit/:id" element={<BookFormPage />} />
              <Route path="/admin/categories" element={<CategoryListPage />} />
              <Route path="/admin/categories/new" element={<CategoryFormPage />} />
              <Route path="/admin/categories/edit/:id" element={<CategoryFormPage />} />
              <Route path="/admin/authors" element={<AuthorListPage />} />
              <Route path="/admin/authors/new" element={<AuthorFormPage />} />
              <Route path="/admin/authors/edit/:id" element={<AuthorFormPage />} />
              <Route path="/admin/publishers" element={<PublisherListPage />} />
              <Route path="/admin/publishers/new" element={<PublisherFormPage />} />
              <Route path="/admin/publishers/edit/:id" element={<PublisherFormPage />} />
              <Route path="/admin/orders" element={<OrderListPage />} />
              <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
          
        </Route>

        {/* Rute Publik (Tidak butuh login, pakai UserLayout) */}
        <Route element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/books" element={<BookCatalogPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/categories/:id/books" element={<CategoryBooksPage />} />
            <Route path="/category/:id" element={<CategoryBooksPage />} />
        </Route>

        {/* Halaman Not Found (Paling Akhir) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}

export default App;