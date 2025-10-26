import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Hapus BrowserRouter as Router
import { AuthProvider } from './Context/AuthContext'; // Hapus .jsx jika bundler bisa resolve
import { CartProvider } from './Context/CartContext';   // Hapus .jsx jika bundler bisa resolve
import AdminLayout from './components/Layout/AdminLayout'; // Hapus .jsx jika bundler bisa resolve
import UserLayout from './components/Layout/UserLayout';   // Hapus .jsx jika bundler bisa resolve
import { WishlistProvider } from './Context/WishlistContext'; // Hapus .jsx jika bundler bisa resolve

import AuthGuard from './components/Layout/AuthGuard';     // Hapus .jsx jika bundler bisa resolve
import GuestRoute from './components/Layout/GuestRoute';   // Hapus .jsx jika bundler bisa resolve
// Gunakan named import jika AdminGuard tidak diexport default
import { AdminGuard } from './components/Layout/AdminGuard'; // Hapus .jsx jika bundler bisa resolve

// --- Impor Halaman ---
import HomePage from './pages/HomePage';                 // Hapus .jsx jika bundler bisa resolve
import LoginPage from './pages/Shared/LoginPage';        // Hapus .jsx jika bundler bisa resolve
import RegisterPage from './pages/Register/RegisterPage'; // Hapus .jsx jika bundler bisa resolve
import BookCatalogPage from './pages/BookCatalogPage';     // Hapus .jsx jika bundler bisa resolve
import BookDetailPage from './pages/BookDetailPage';       // Hapus .jsx jika bundler bisa resolve
import WishlistPage from './pages/WishlistPage';         // Hapus .jsx jika bundler bisa resolve
import ProfilePage from './pages/ProfilePage';           // Hapus .jsx jika bundler bisa resolve
import CheckoutPage from './pages/CheckoutPage';           // Hapus .jsx jika bundler bisa resolve
import CartPage from './pages/CartPage';                   // Hapus .jsx jika bundler bisa resolve
import CategoryBooksPage from "./pages/Categories/CategoryBooksPage"; // Hapus .jsx jika bundler bisa resolve

// --- Impor Halaman Admin ---
import DashboardPage from './pages/DashboardPage';           // Hapus .jsx jika bundler bisa resolve
import BookListPage from './pages/Books/BookListPage';         // Hapus .jsx jika bundler bisa resolve
import BookFormPage from './pages/Books/BookFormPage';         // Hapus .jsx jika bundler bisa resolve
import CategoryListPage from './pages/Categories/CategoryListPage'; // Hapus .jsx jika bundler bisa resolve
import CategoryFormPage from './pages/Categories/CategoryFormPage'; // Hapus .jsx jika bundler bisa resolve
import AuthorListPage from './pages/Authors/AuthorListPage';     // Hapus .jsx jika bundler bisa resolve
import AuthorFormPage from './pages/Authors/AuthorFormPage';     // Hapus .jsx jika bundler bisa resolve
import PublisherListPage from './pages/Publishers/PublisherListPage'; // Hapus .jsx jika bundler bisa resolve
import PublisherFormPage from './pages/Publishers/PublisherFormPage'; // Hapus .jsx jika bundler bisa resolve
import OrderListPage from './pages/Orders/OrderListPage';        // Hapus .jsx jika bundler bisa resolve
import OrderDetailPage from './pages/Orders/OrderDetailPage';      // Hapus .jsx jika bundler bisa resolve
import NotFoundPage from './pages/Shared/NotFoundPage';        // Hapus .jsx jika bundler bisa resolve


function App() {
  return (
    // <Router> <---- Hapus tag <Router> dari sini jika ada, karena sudah ada di main.jsx
      <Routes>
        {/* Rute Tamu (Login, Register) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rute Pengguna Terautentikasi */}
        <Route element={<AuthGuard><UserLayout /></AuthGuard>}>
          {/* Halaman yang *hanya* bisa diakses setelah login TAPI pakai UserLayout */}
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile/*" element={<ProfilePage />} /> {/* Menangani rute nested di ProfilePage */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<CartPage />} />
          {/* Tambahkan rute user lain di sini jika perlu */}
        </Route>

        {/* Rute Admin */}
        {/* Pastikan AdminGuard juga di dalam AuthGuard */}
        <Route element={<AuthGuard><AdminGuard><AdminLayout /></AdminGuard></AuthGuard>}>
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

         {/* Rute Publik (yang dapat diakses semua orang) dengan UserLayout */}
         {/* Penting: Letakkan ini SETELAH rute user/admin yang lebih spesifik jika ada overlap */}
         <Route element={<UserLayout />}>
             <Route index element={<HomePage />} />
             <Route path="/books" element={<BookCatalogPage />} />
             <Route path="/books/:id" element={<BookDetailPage />} />
             <Route path="/categories/:id/books" element={<CategoryBooksPage />} />
             {/* Tambahkan rute publik lain di sini */}
         </Route>

        {/* Halaman Not Found (Paling Akhir) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    // </Router> <---- Hapus tag penutup </Router> dari sini jika ada
  );
}

export default App;

