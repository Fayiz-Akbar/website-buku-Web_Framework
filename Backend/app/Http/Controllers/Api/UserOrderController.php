<?php
// File: Backend/app/Http/Controllers/Api/UserOrderController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Http\Resources\OrderResource; // Pastikan OrderResource meng-eager load relasi yang diperlukan
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserOrderController extends Controller
{
    /**
     * Menampilkan riwayat pesanan user yang sedang login.
     * Endpoint: GET /api/my-orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Eager load relasi yang diperlukan untuk daftar pesanan
        $orders = Order::where('user_id', $user->id)
                       ->with(['payment', 'address'])
                       ->orderBy('created_at', 'desc')
                       ->paginate(10); // Paginate 10 order per halaman

        return OrderResource::collection($orders);
    }

    /**
     * Menampilkan detail satu pesanan user yang sedang login.
     * Endpoint: GET /api/my-orders/{order}
     */
    public function show(Request $request, Order $order)
    {
        // Pastikan order milik user yang sedang login
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Pesanan tidak ditemukan atau akses ditolak.'], 404);
        }

        // Eager load semua detail yang dibutuhkan oleh frontend
        $order->load([
            'payment', 
            'address', 
            'items', 
            // Memuat relasi buku bersarang di item
            'items.book' => function ($query) {
                $query->with(['authors', 'publisher', 'categories']);
            }
        ]);
        
        return OrderResource::make($order);
    }

    /**
     * Memungkinkan user mengupload bukti pembayaran.
     * Endpoint: POST /api/my-orders/{order}/upload-proof
     */
    public function uploadPaymentProof(Request $request, Order $order)
    {
        // 1. Cek Otorisasi
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // 2. Cek Status Pembayaran
        if (!$order->payment || $order->payment->status !== 'waiting_validation') {
            return response()->json(['message' => 'Pembayaran tidak dapat diunggah pada status ini. Status pembayaran saat ini: ' . ($order->payment->status ?? 'N/A')], 403);
        }

        // 3. Validasi File
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        // 4. Proses Upload File
        try {
            // Hapus bukti lama jika ada (jika user upload ulang)
            if ($order->payment->payment_proof_url) {
                // Mengubah URL Storage::url() menjadi path 'public/' untuk Storage::delete()
                $oldPath = str_replace(url('storage/'), 'public/', $order->payment->payment_proof_url);
                Storage::delete($oldPath);
            }

            // Simpan file baru di 'storage/app/public/payment_proofs'
            $path = $request->file('payment_proof')->store('public/payment_proofs');
            $url = Storage::url($path);

            // 5. Update Payment Model
            $order->payment->update([
                'payment_proof_url' => $url,
                'status' => 'pending', // Ubah status menjadi 'pending' setelah bukti diupload
            ]);

            return response()->json([
                'message' => 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi Admin.',
                'proof_url' => $url
            ]);

        } catch (\Exception $e) {
            // Log error
            \Log::error('Upload payment proof failed for order ' . $order->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mengunggah file. Cek log server.'], 500);
        }
    }
}
