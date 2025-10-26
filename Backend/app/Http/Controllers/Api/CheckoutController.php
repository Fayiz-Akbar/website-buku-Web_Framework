<?php
// File: Backend/app/Http/Controllers/Api/CheckoutController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function processCheckout(Request $request)
    {
        $user = $request->user();
        
        // [PERBAIKAN] Pastikan user punya keranjang sebelum validasi 'exists'
        $cart = $user->cart;
        if (!$cart) {
            return response()->json(['message' => 'Keranjang tidak ditemukan.'], 404);
        }

        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'amount_paid' => 'required|numeric|min:1',
            'payment_proof' => 'required|image|mimes:jpg,png,jpeg|max:2048', 
            'user_address_id' => [
                'required',
                'integer',
                'exists:user_addresses,id,user_id,' . $user->id 
            ],

            // --- [TAMBAHAN BARU] ---
            // Validasi item yang dipilih
            'items' => 'required|array|min:1', // Harus ada, harus array, minimal 1 item
            'items.*' => [
                'required',
                'integer',
                // Pastikan setiap item ID ada di tabel cart_items
                // DAN item itu milik keranjang user yang sedang login
                'exists:cart_items,id,cart_id,' . $cart->id 
            ],
            // --- Batas Tambahan ---
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 2. Panggil Service (Service akan menangani $request->all()['items'])
            $order = $this->checkoutService->process($user, $request->all());

            // 3. Kembalikan response sukses
            return response()->json([
                'message' => 'Checkout berhasil, pesanan sedang diproses.',
                'order_id' => $order->id,
            ], 201); 

        } catch (\Exception $e) {
            // 4. Tangkap error (misal: stok habis)
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}