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

        // Filter untuk status pembayaran (pending, success, failed)
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
    
    // =================================================================
    // LOGIKA BARU: VERIFIKASI PEMBAYARAN OLEH ADMIN
    // =================================================================

    /**
     * Menyetujui Pembayaran dan Mengubah Status Pesanan.
     */
    public function approve(Order $order)
    {
        if (!$order->payment) {
            return response()->json(['message' => 'Pesanan ini tidak memiliki data pembayaran.'], 422);
        }

        // Periksa apakah bukti bayar sudah diunggah sebelum disetujui
        if (empty($order->payment->payment_proof_url)) {
            return response()->json(['message' => 'Bukti pembayaran belum diunggah oleh user.'], 403);
        }
        
        // 1. Update status pembayaran
        $order->payment->update([
            'status' => 'paid',
            'confirmed_at' => now(),
            'admin_notes' => 'Pembayaran disetujui. Barang segera diproses.'
        ]);
        
        // 2. Update status order untuk user
        // Status: 'pembayaran disetujui, siap dikirim'
        $order->update([
            'status' => 'diproses', 
        ]);

        // FIX: Trigger event untuk mengurangi stok jika menggunakan event listener
        // event(new OrderProcessed($order));

        return response()->json([
            'message' => 'Pesanan berhasil disetujui. Status Pembayaran: success, Status Order: diproses.'
        ], 200);
    }

    /**
     * Menolak Pembayaran dan Mengubah Status Pesanan menjadi Dibatalkan.
     */
    public function reject(Request $request, Order $order)
    {
        $request->validate(['reason' => 'required|string|max:255']);
        
        if (!$order->payment) {
            return response()->json(['message' => 'Pesanan ini tidak memiliki data pembayaran.'], 422);
        }

        // 1. Update status pembayaran
        $order->payment->update([
            'status' => 'failed',
            'admin_notes' => 'Pembayaran ditolak: ' . $request->reason,
        ]);
        
        // 2. Update status order
        $order->update([
            'status' => 'dibatalkan', 
        ]);

        return response()->json([
            'message' => 'Pesanan berhasil ditolak. Status Pembayaran: failed, Status Order: dibatalkan.'
        ], 200);
    }
}
