import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Context Providers (Diasumsikan tanpa .jsx) ---
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import { WishlistProvider } from './Context/WishlistContext';

// --- Components & Guards (FIX: Tambahkan ekstensi .jsx agar file dapat ditemukan) ---
import AdminLayout from './components/Layout/AdminLayout.jsx';
import UserLayout from './components/Layout/UserLayout.jsx';
import AuthGuard from './components/Layout/AuthGuard.jsx';
import GuestRoute from './components/Layout/GuestRoute.jsx';
import { AdminGuard } from './components/Layout/AdminGuard.jsx'; // Menggunakan named import

// --- Impor Halaman (FIX: Tambahkan ekstensi .jsx) ---
// Shared/Public Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/Shared/LoginPage.jsx';
import RegisterPage from './pages/Register/RegisterPage.jsx';
import BookCatalogPage from './pages/BookCatalogPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import NotFoundPage from './pages/Shared/NotFoundPage.jsx';
import CategoryBooksPage from "./pages/Categories/CategoryBooksPage.jsx";

// User Authenticated Pages
import WishlistPage from './pages/WishlistPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import CartPage from './pages/CartPage.jsx';

// Admin Pages
import DashboardPage from './pages/DashboardPage.jsx';
import BookListPage from './pages/Books/BookListPage.jsx';
import BookFormPage from './pages/Books/BookFormPage.jsx';
import CategoryListPage from './pages/Categories/CategoryListPage.jsx';
import CategoryFormPage from './pages/Categories/CategoryFormPage.jsx';
import AuthorListPage from './pages/Authors/AuthorListPage.jsx';
import AuthorFormPage from './pages/Authors/AuthorFormPage.jsx';
import PublisherListPage from './pages/Publishers/PublisherListPage.jsx';
import PublisherFormPage from './pages/Publishers/PublisherFormPage.jsx';
import OrderListPage from './pages/Orders/OrderListPage.jsx';
import OrderDetailPage from './pages/Orders/OrderDetailPage.jsx';


function App() {
  return (
      <Routes>
        {/* 1. Rute Tamu (Hanya dapat diakses jika BELUM login) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 2. Rute Autentikasi (Membutuhkan LOGIN / Dibungkus AuthGuard) */}
        <Route element={<AuthGuard />}>
          
          {/* 2a. Rute USER yang butuh login (Dibungkus UserLayout) */}
          <Route element={<UserLayout />}>
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile/*" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* 2b. Rute ADMIN (Membutuhkan AdminGuard, Dibungkus AdminLayout) */}
          <Route element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/books" element={<BookListPage />} />
              <Route path="/admin/books/new" element={<BookFormPage />} />
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
              {/* Redirect /admin ke /admin/dashboard */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>
          
        </Route>

        {/* 3. Rute Publik (Tidak butuh login, pakai UserLayout) */}
        <Route element={<UserLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/books" element={<BookCatalogPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/categories/:id/books" element={<CategoryBooksPage />} />
        </Route>

        {/* 4. Halaman Not Found (Paling Akhir) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}

export default App;
