<?php
// File: Backend/app/Http/Controllers/Api/AdminDashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Book;
use App\Models\User;

class AdminDashboardController extends Controller
{
    /**
     * Mengambil data statistik untuk dashboard admin.
     * GET /api/admin/stats
     */
    public function stats(Request $request)
    {
        // Mendefinisikan status pesanan yang dianggap 'sukses' (sudah diproses/selesai)
        $successStatuses = ['diproses', 'dikirim', 'selesai'];
        
        // 1. Hitung Total Penjualan
        $totalSales = Order::whereIn('status', $successStatuses)
                           ->sum('final_amount');
                           
        // 2. Hitung Jumlah Buku
        $booksCount = Book::count();
        
        // 3. Hitung Pesanan yang Menunggu Validasi
        // Mencakup status 'menunggu_validasi' dari Order atau 'waiting_validation' dari Payment
        $newOrdersPending = Order::where('status', 'menunggu_validasi')
                                  ->orWhereHas('payment', function($q) {
                                      $q->where('status', 'waiting_validation');
                                  })
                                  ->count();
                                  
        // 4. Hitung Total Pengguna
        $totalUsers = User::count();
        
        // Kembalikan respons dalam format yang diharapkan DashboardPage.jsx
        return response()->json([
            'total_sales' => $totalSales,
            'books_count' => $booksCount,
            'new_orders_pending' => $newOrdersPending,
            'total_users' => $totalUsers,
        ]);
    }
}