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


/*
|--------------------------------------------------------------------------
| RUTE PUBLIK (Tidak perlu login)
|--------------------------------------------------------------------------
*/
// Autentikasi
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Read-Only Buku
Route::get('/books', [BookController::class, 'index']); // Daftar buku (paginasi)
Route::get('/books/{id}', [BookController::class, 'show']); // Detail buku

Route::get('/categories', [CategoryController::class, 'index']);

/*
|--------------------------------------------------------------------------
| RUTE USER (Perlu Login - auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Alur Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // (Rute lain untuk user: cart, my-orders, my-profile, dll.)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});


/*
|--------------------------------------------------------------------------
| RUTE ADMIN (Perlu Login & Role Admin - ['auth:sanctum', 'admin'])
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin') // URL prefix /api/admin/...
    ->group(function () {

    // (Langkah 2) CRUD Kategori
    Route::apiResource('/categories', CategoryController::class);
    
    // (Langkah 2) CRUD Penulis
    Route::apiResource('/authors', AuthorController::class);
    
    // (Langkah 2) CRUD Penerbit
    Route::apiResource('/publishers', PublisherController::class);

    // (Langkah 3) CRUD Buku
    // Kita hanya gunakan 'store', 'update', 'destroy'
    // karena 'index' dan 'show' sudah ada di rute publik.
    Route::apiResource('/books', BookController::class)->only([
        'store', 'update', 'destroy'
    ]);
    
    // (Langkah 4) Manajemen Pesanan
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
    Route::post('/orders/{order}/approve', [AdminOrderController::class, 'approve']);
    Route::post('/orders/{order}/reject', [AdminOrderController::class, 'reject']);

    
    // Rute Tes Keamanan (dari file Anda)
    Route::get('/test', function (Request $request) {
        return response()->json([
            'message' => 'Selamat datang, Admin!',
            'user' => $request->user(),
        ]);
    });
});