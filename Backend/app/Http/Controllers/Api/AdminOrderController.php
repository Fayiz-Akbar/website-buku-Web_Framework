<?php
// File: Backend/app/Http/Controllers/Api/AdminOrderController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminOrderController extends Controller
{
    /**
     * Menampilkan daftar semua pesanan.
     */
    public function index(Request $request)
    {
        // FIX KRITIS: Eager Loading yang Paling Aman
        $query = Order::with([
                       'user', 
                       'payment',
                       'address',
                       // Memuat items dan semua relasi buku yang dibutuhkan
                       'items.book' => function ($query) {
                           // Memuat relasi bersarang di sini
                           $query->with(['authors', 'publisher', 'categories']);
                       }
                   ])
                   ->orderBy('created_at', 'desc');

        // Filter untuk status pembayaran (menunggu_validasi, success, failed)
        if ($request->has('payment_status')) {
            $query->whereHas('payment', function ($q) use ($request) {
                $q->where('status', $request->payment_status);
            });
        }

        $orders = $query->paginate(20);
        
        return OrderResource::collection($orders);
    }

    /**
     * Menampilkan detail satu pesanan.
     */
    public function show(Order $order)
    {
        // FIX KRITIS: Eager Loading yang Paling Aman untuk detail
        $order->load([
            'user', 
            'address', 
            'payment', 
            'items', 
            'items.book' => function ($query) {
                $query->with(['authors', 'publisher', 'categories']);
            }
        ]);
        
        return OrderResource::make($order);
    }
    
    // (Metode approve dan reject sama seperti sebelumnya)
    public function approve(Order $order)
    {
        // ... (Logika sama)
        if (!$order->payment) {
            return response()->json(['message' => 'Pesanan ini tidak memiliki data pembayaran.'], 422);
        }

        $order->payment->update([
            'status' => 'success',
            'confirmed_at' => now(),
            'admin_notes' => 'Pembayaran dikonfirmasi oleh admin.'
        ]);
        
        $order->update([
            'status' => 'diproses',
        ]);

        return response()->json(['message' => 'Pesanan berhasil disetujui.']);
    }

    public function reject(Request $request, Order $order)
    {
        // ... (Logika sama)
        $request->validate(['reason' => 'required|string|max:255']);
        
        if (!$order->payment) {
            return response()->json(['message' => 'Pesanan ini tidak memiliki data pembayaran.'], 422);
        }

        $order->payment->update([
            'status' => 'failed',
            'admin_notes' => 'Pembayaran ditolak: ' . $request->reason,
        ]);
        
        $order->update([
            'status' => 'dibatalkan',
        ]);

        return response()->json(['message' => 'Pesanan berhasil ditolak.']);
    }
}