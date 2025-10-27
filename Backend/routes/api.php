<?php
// File: Backend/routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =================================================================
// PERBAIKAN NAMESPACE
// =================================================================
// Kontroler yang menampilkan gambar (Buku, Kategori, dll.)
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserAddressController;

// Kontroler fungsional (Keranjang, Admin, dll.)
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\BookController as AdminBookController; // Alias untuk Admin
use App\Http\Controllers\Api\CartController; // <-- Benar untuk Keranjang
use App\Http\Controllers\Api\CategoryController as AdminCategoryController; // Alias untuk Admin
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\PublisherController;
// Import Controller Riwayat Pesanan
use App\Http\Controllers\Api\UserOrderController;
use App\Http\Controllers\Api\AdminDashboardController; // Tambahkan ini
use App\Http\Controllers\Admin\AuthorAdminController;
use App\Http\Controllers\Admin\CategoryAdminController;
use App\Http\Controllers\Admin\PublisherAdminController;
// =================================================================


/*
|--------------------------------------------------------------------------
| RUTE PUBLIK (Tidak perlu login)
|--------------------------------------------------------------------------
*/
// 🔐 Autentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 📚 Buku & Kategori (Menggunakan kontroler root agar gambar muncul)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/{id}/books', [BookController::class, 'byCategory']);

/*
|--------------------------------------------------------------------------
| RUTE USER (Perlu Login - auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // 🔒 Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // 👤 Ambil data user saat ini
    Route::get('/user', fn (Request $r) => $r->user());

    // ✏️ Update profil user (nama, alamat, foto profil)
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // 🔑 Update password user
    Route::post('/user/password', [AuthController::class, 'updatePassword']);

    // =================================================================
    // 🛒 Keranjang belanja (Menggunakan Api\CartController)
    // =================================================================
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addBook']);
    Route::put('/cart/{cartItemId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/{cartItemId}', [CartController::class, 'removeBook']);

    // 📸 Profil tambahan
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/me', [ProfileController::class, 'me']);

    // 📦 Manajemen alamat pengguna
    Route::get('/user/addresses', [UserAddressController::class, 'index']);
    Route::post('/user/addresses', [UserAddressController::class, 'store']);
    Route::get('/user/addresses/{id}', [UserAddressController::class, 'show']);
    Route::put('/user/addresses/{id}', [UserAddressController::class, 'update']);
    Route::delete('/user/addresses/{id}', [UserAddressController::class, 'destroy']);
    Route::put('/user/addresses/{id}/primary', [UserAddressController::class, 'setPrimary']);

    // 💳 Checkout (Menggunakan Api\CheckoutController)
    // PERBAIKAN NAMA FUNGSI: Harus 'processCheckout' sesuai Controller Anda
    Route::post('/checkout', [CheckoutController::class, 'processCheckout']); // <-- Perbaikan di sini

    // 🧾 Riwayat Pesanan Pengguna
    Route::get('/my-orders', [UserOrderController::class, 'index']);
    Route::get('/my-orders/{order}', [UserOrderController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| RUTE ADMIN (Perlu Login & Role Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        // FIX KRITIS: Rute Dashboard Admin
        Route::get('/stats', [AdminDashboardController::class, 'stats']); // <-- FIX 404 NOT FOUND

        // 🗂️ CRUD Kategori (Menggunakan kontroler Admin)
        Route::apiResource('/categories', AdminCategoryController::class);

        // ✍️ CRUD Penulis
        Route::apiResource('/authors', AuthorController::class);

        // 🏢 CRUD Penerbit
        Route::apiResource('/publishers', PublisherController::class);

        // 📘 CRUD Buku (Menggunakan kontroler Admin)
        Route::apiResource('/books', AdminBookController::class)->only([
            'store', 'update', 'destroy'
        ]);

        // 📦 Manajemen Pesanan
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::post('/orders/{order}/approve', [AdminOrderController::class, 'approve']);
        Route::post('/orders/{order}/reject', [AdminOrderController::class, 'reject']);

        // 🧾 Riwayat Pesanan Pengguna
        Route::get('/my-orders', [UserOrderController::class, 'index']);
        Route::get('/my-orders/{order}', [UserOrderController::class, 'show']);
        // RUTE BARU UNTUK UPLOAD BUKTI BAYAR
        Route::post('/my-orders/{order}/upload-proof', [UserOrderController::class, 'uploadPaymentProof']); 

        // 🧪 Tes Admin
        Route::get('/test', function (Request $request) {
            return response()->json([
                'message' => 'Selamat datang, Admin!',
                'user' => $request->user(),
            ]);
        });

        Route::get('/authors', [AuthorAdminController::class, 'index']);
        Route::get('/categories', [CategoryAdminController::class, 'index']);
        Route::get('/publishers', [PublisherAdminController::class, 'index']);
    });

