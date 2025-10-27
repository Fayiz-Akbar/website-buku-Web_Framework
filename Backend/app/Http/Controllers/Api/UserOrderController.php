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
    public function index(Request $request)
    {
        $user = $request->user();

        // FIX KRITIS: Eager Loading yang Paling Aman
        $orders = Order::where('user_id', $user->id)
                    ->with([
                        'payment', 
                        'user', 
                        'address',
                        // Memuat items dan semua relasi buku secara bersyarat dan bertingkat
                        'items.book' => function ($query) {
                            $query->with(['authors', 'publisher', 'categories']);
                        }
                    ]) 
                    ->orderBy('created_at', 'desc')
                    ->paginate(10); 

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $order->load([
            'user', 
            'address', 
            'payment', 
            'items', 
            'items.book' => function ($query) {
                $query->with(['authors', 'publisher', 'categories']);
            }
        ]);

        return new OrderResource($order);
    }
}