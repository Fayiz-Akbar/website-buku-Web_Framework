<?php

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
     * GET /api/admin/orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'payment'])
                       ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
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
     * GET /api/admin/orders/{id}
     */
    public function show(Order $order)
    {
        // SUDAH DISESUAIKAN: Menggunakan relasi 'address'
        $order->load(['user', 'address', 'payment', 'items', 'items.book']);
        
        return OrderResource::make($order);
    }

    /**
     * Menyetujui pembayaran pesanan.
     * POST /api/admin/orders/{id}/approve
     */
    public function approve(Order $order)
    {
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

    /**
     * Menolak pembayaran pesanan.
     * POST /api/admin/orders/{id}/reject
     */
    public function reject(Request $request, Order $order)
    {
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