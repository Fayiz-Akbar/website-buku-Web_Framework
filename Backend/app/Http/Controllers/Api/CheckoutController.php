<?php
// File: Backend/app/Http/Controllers/Api/CheckoutController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService; // <-- Import Service kita
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    protected $checkoutService;

    // Kita "suntik" (inject) service kita ke controller
    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    /**
     * Menangani request checkout dari user.
     * POST /api/checkout
     */
    public function processCheckout(Request $request)
    {
        $user = $request->user();

        // 1. Validasi Input (Request akan berupa form-data)
        $validator = Validator::make($request->all(), [
            // Sesuai permintaanmu, user input jumlah yang dibayar
            'amount_paid' => 'required|numeric|min:1',
            
            // Sesuai permintaanmu, user upload bukti bayar
            'payment_proof' => 'required|image|mimes:jpg,png,jpeg|max:2048', // Maks 2MB
            
            // Kita butuh alamat pengiriman
            // 'exists' akan cek ke tabel 'user_addresses' kolom 'id'
            // dan memastikan alamat itu milik 'user_id' yang sedang login
            'user_address_id' => [
                'required',
                'integer',
                'exists:user_addresses,id,user_id,' . $user->id 
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 2. Panggil "otak"-nya (Service)
            $order = $this->checkoutService->process($user, $request->all());

            // 3. Kembalikan response sukses
            return response()->json([
                'message' => 'Checkout berhasil, pesanan sedang diproses.',
                'order_id' => $order->id,
            ], 201); // 201 Created

        } catch (\Exception $e) {
            // 4. Tangkap error (misal: stok habis, keranjang kosong)
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}