<?php
// File: Backend/app/Services/CheckoutService.php

namespace App\Services;

use App\Models\User;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Book;
use App\Events\OrderProcessed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class CheckoutService
{
    /**
     * Memproses checkout user, membuat Order, dan Payment.
     *
     * @param User $user User yang sedang login
     * @param array $data Data tervalidasi dari controller (termasuk 'items' array of cart_item IDs)
     * @return Order
     * @throws Exception
     */
    public function process(User $user, array $data): Order
    {
        $cart = $user->cart;
        if (!$cart) {
            throw new \Exception('Keranjang tidak ditemukan.');
        }

        // 1. FILTER ITEM: Dapatkan hanya item keranjang yang dipilih
        $selectedCartItems = $cart->items()
            ->with('book')
            ->whereIn('id', $data['items']) 
            ->get();

        if ($selectedCartItems->isEmpty()) {
            throw new \Exception('Tidak ada item yang valid untuk dicheckout.');
        }

        // 2. Mulai Transaksi Database
        $order = DB::transaction(function () use ($user, $cart, $data, $selectedCartItems) {

            // 3. Hitung total harga HANYA dari item yang dipilih
            $totalPrice = $selectedCartItems->sum(function ($item) {
                return $item->price * $item->quantity;
            });
            
            $shippingCost = 15000; 

            // 4. Simpan file bukti pembayaran
            $filePath = $data['payment_proof']->store('payment_proofs', 'public');
            $orderCode = 'ORD-' . strtoupper(Str::random(8));

            // 5. Buat entri Order
            $order = $user->orders()->create([
                'user_id' => $user->id,
                'user_address_id' => $data['user_address_id'],
                'order_code' => $orderCode,
                
                'status' => 'menunggu_validasi', 
                
                'total_items_price' => $totalPrice, 
                'discount_amount' => 0, 
                'shipping_cost' => $shippingCost, 
                'final_amount' => $totalPrice + $shippingCost, 
            ]);

            // 6. Buat entri Payment
            $order->payment()->create([
                'order_id' => $order->id,
                'method' => 'qris_manual',
                
                'status' => 'waiting_validation', 
                
                'amount_due' => $order->final_amount, 
                'amount_paid' => $data['amount_paid'], 
                'payment_proof_url' => $filePath,
                'payment_date' => now(), 
            ]);

            // 7. Pindahkan item dari Cart ke OrderItem
            foreach ($selectedCartItems as $cartItem) {
                $book = Book::findOrFail($cartItem->book_id);
                
                if ($book->stock < $cartItem->quantity) {
                    throw new \Exception('Stok untuk buku "' . $book->title . '" tidak mencukupi.');
                }

                $order->items()->create([
                    'book_id'    => $cartItem->book_id,
                    'quantity'   => $cartItem->quantity,
                    
                    // **FIX SQL ERROR 23502**: Menyediakan nilai untuk kolom 'price'
                    'price' => $cartItem->price, // Menggunakan harga dari CartItem
                    
                    'snapshot_book_title' => $cartItem->book->title,
                    'snapshot_price_per_item' => $cartItem->price,
                ]);
            }

            // 8. Hapus HANYA item yang di-checkout dari keranjang
            $cart->items()->whereIn('id', $data['items'])->delete();
            
            return $order;
        });

        $order->load('payment'); 
        return $order;
    }
}