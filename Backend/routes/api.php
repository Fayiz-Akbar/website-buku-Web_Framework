<?php
// File: Backend/routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Import Semua Controller (Kita standarkan semua di 'Api' Namespace)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\PublisherController;
use App\Http\Controllers\Api\AdminOrderController;
use App\Http\Controllers\Api\CartController;

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
Route::get('/books/{id}', [BookController::class, 'show']); // Detail buku
Route::get('/categories', [CategoryController::class, 'index']);

/*
|--------------------------------------------------------------------------
| RUTE USER (Perlu Login - auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Ambil data user saat ini
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Update profil user (nama, alamat, foto profil)
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // Alur Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/checkout', [CheckoutController::class, 'processCheckout']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addBook']);
    Route::put('/cart/{cartItemId}', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/{cartItemId}', [CartController::class, 'removeBook']);
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
