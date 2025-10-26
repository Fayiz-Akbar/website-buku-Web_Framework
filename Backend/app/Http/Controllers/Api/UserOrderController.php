<?php
// File: Backend/app/Http/Controllers/Api/UserOrderController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserOrderController extends Controller
{
    /**
     * Menampilkan daftar pesanan milik user yang sedang login.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // FIX KRITIS: Eager Loading komprehensif untuk list view
        $orders = Order::where('user_id', $user->id)
                    ->with([
                        'payment', 
                        'user', 
                        'address',
                        // Memuat items dan semua relasi buku yang mungkin (authors, publisher, categories)
                        'items.book.authors', 
                        'items.book.publisher',
                        'items.book.categories'
                    ]) 
                    ->orderBy('created_at', 'desc')
                    ->paginate(10); 

        return OrderResource::collection($orders);
    }

    /**
     * Menampilkan detail satu pesanan milik user yang sedang login.
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Pastikan pesanan ini milik user yang sedang login
        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        // FIX KRITIS: Eager Loading komprehensif untuk detail view
        $order->load([
            'user', 
            'address', 
            'payment', 
            // Memuat items dan semua relasi buku yang mungkin
            'items.book.authors', 
            'items.book.publisher',
            'items.book.categories'
        ]);

        return new OrderResource($order);
    }
}