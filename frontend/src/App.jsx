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
import WishlistPage from './pages/WishlistPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx'; 
// import CartPage from './pages/CartPage'; // Diabaikan sesuai instruksi

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
      {/* Rute Tamu */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Rute User (Menggunakan UserLayout) */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/books" element={<BookCatalogPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* Rute Cart dan Checkout diabaikan sesuai instruksi Anda */}
        
        {/* --- RUTE PROFIL (Dilindungi AuthGuard) --- */}
        {/* Semua rute profil akan merender ProfilePage.jsx, dan ProfilePage.jsx yang akan menentukan sub-komponen mana yang tampil (Data Diri, Password, Alamat, dll.) berdasarkan URL. */}
        <Route element={<AuthGuard />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/password" element={<ProfilePage />} />
            <Route path="/profile/addresses" element={<ProfilePage />} />
            <Route path="/profile/orders" element={<ProfilePage />} />
            <Route path="/profile/wishlist" element={<ProfilePage />} />
        </Route>

      </Route>

      {/* Rute Admin */}
      <Route 
        path="/" 
        element={ <AuthGuard><AdminLayout /></AuthGuard> }
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
