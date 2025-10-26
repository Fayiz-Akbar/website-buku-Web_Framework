<?php
// File: Backend/app/Http/Controllers/Api/CartController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book; // <-- Import model Book
use App\Models\CartItem; // <-- Import model CartItem
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Menampilkan isi keranjang milik user yang sedang login.
     * GET /api/cart
     */
    public function index(Request $request)
    {
        // Dapatkan user yang sedang login (berkat middleware auth:sanctum)
        $user = $request->user();

        // Dapatkan keranjangnya (atau buat baru jika tidak ada)
        $cart = $user->cart()->firstOrCreate();

        // --- PERBAIKAN DI SINI ---
        // Ambil item keranjang, beserta data buku DAN data penulis buku (book.authors)
        $cartItems = $cart->items()->with('book.authors')->get();
        // -------------------------

        return response()->json(['data' => $cartItems], 200);
    }

    /**
     * Menambah buku ke keranjang.
     * POST /api/cart/add
     */
    public function addBook(Request $request)
    {
        // 1. Validasi input
        $validator = Validator::make($request->all(), [
            'book_id' => 'required|integer|exists:books,id', // Pastikan book_id ada di tabel books
            'quantity' => 'required|integer|min:1', // Jumlah minimal 1
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Dapatkan data
        $bookId = $request->input('book_id');
        $quantity = $request->input('quantity');
        $user = $request->user();

        // 3. Cek stok buku
        $book = Book::findOrFail($bookId);
        if ($book->stock < $quantity) {
            return response()->json(['message' => 'Stok buku tidak mencukupi.'], 400);
        }

        // 4. Dapatkan keranjang user (atau buat baru)
        $cart = $user->cart()->firstOrCreate();

        // 5. Cek apakah buku ini sudah ada di keranjang?
        $cartItem = $cart->items()->where('book_id', $bookId)->first();

        if ($cartItem) {
            // Jika sudah ada, tambahkan quantity-nya
            $newQuantity = $cartItem->quantity + $quantity;

            // Cek stok lagi
            if ($book->stock < $newQuantity) {
                return response()->json(['message' => 'Stok buku tidak mencukupi untuk jumlah total.'], 400);
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Jika belum ada, buat item keranjang baru
            $cartItem = $cart->items()->create([
                'book_id' => $bookId,
                'quantity' => $quantity,
                'price'    => $book->price,
            ]);
        }

        // 6. Kembalikan response sukses
        return response()->json([
            'message' => 'Buku berhasil ditambahkan ke keranjang.',
            'data' => $cartItem
        ], 201); // 201 Created
    }

    // ... (Fungsi removeBook dan updateQuantity Anda)
}