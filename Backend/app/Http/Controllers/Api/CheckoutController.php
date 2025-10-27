<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(protected CheckoutService $checkoutService) {}

    public function processCheckout(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart;
        if (!$cart) {
            return response()->json(['message' => 'Keranjang tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'amount_paid'     => 'required|numeric|min:1',
            'payment_proof'   => 'required|image|mimes:jpg,png,jpeg|max:2048',
            'user_address_id' => ['required','integer','exists:user_addresses,id,user_id,'.$user->id],
            'items'           => 'required|array|min:1',
            'items.*'         => 'required|integer|exists:cart_items,id,cart_id,'.$cart->id,
        ]);

        try {
            $order = $this->checkoutService->process($user, $request->all());

            return response()->json([
                'message'     => 'Checkout berhasil, pesanan sedang diproses.',
                'order_id'    => $order->id,
                'order_code'  => $order->order_code, // FE menampilkan ini
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}