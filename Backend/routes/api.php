<?php
// File: Backend/routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\PublisherController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| RUTE PUBLIK (Tidak perlu login)
|--------------------------------------------------------------------------
*/
// Autentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Read-Only Buku
Route::get('/books', [BookController::class, 'index']); // Daftar buku
Route::get('/books/{book}', [BookController::class, 'show']); // ganti {id} -> {book} // Detail buku
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/{id}/books', [BookController::class, 'byCategory']); // opsional

/*
|--------------------------------------------------------------------------
| RUTE USER (Perlu Login - auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Ambil data user saat ini
    Route::get('/user', fn (Request $r) => $r->user());

    // Update profil user (nama, alamat, foto profil)
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Update password user
    Route::post('/user/password', [AuthController::class, 'updatePassword']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addBook']);
    Route::put('/cart/{cartItemId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/{cartItemId}', [CartController::class, 'removeBook']);

    // Profile
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/me', [ProfileController::class, 'me']);

    
    // 📦 Manajemen alamat pengguna
    Route::get('/user/addresses', [UserAddressController::class, 'index']); // Ambil semua alamat
    Route::post('/user/addresses', [UserAddressController::class, 'store']); // Tambah alamat baru
    Route::get('/user/addresses/{id}', [UserAddressController::class, 'show']); // Detail alamat
    Route::put('/user/addresses/{id}', [UserAddressController::class, 'update']); // Update alamat
    Route::delete('/user/addresses/{id}', [UserAddressController::class, 'destroy']); // Hapus alamat
    Route::put('/user/addresses/{id}/primary', [UserAddressController::class, 'setPrimary']); // Set alamat utama
});

/*
|--------------------------------------------------------------------------
| RUTE ADMIN (Perlu Login & Role Admin - ['auth:sanctum', 'admin'])
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        // CRUD Kategori
        Route::apiResource('/categories', CategoryController::class);

        // CRUD Penulis
        Route::apiResource('/authors', AuthorController::class);

        // CRUD Penerbit
        Route::apiResource('/publishers', PublisherController::class);

        // CRUD Buku (store, update, destroy)
        Route::apiResource('/books', BookController::class)->only([
            'store', 'update', 'destroy'
        ]);

        // Manajemen Pesanan
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::post('/orders/{order}/approve', [AdminOrderController::class, 'approve']);
        Route::post('/orders/{order}/reject', [AdminOrderController::class, 'reject']);

        // Tes Admin
        Route::get('/test', function (Request $request) {
            return response()->json([
                'message' => 'Selamat datang, Admin!',
                'user' => $request->user(),
            ]);
        });
    });
