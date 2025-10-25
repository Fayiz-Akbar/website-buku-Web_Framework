<?php
// File: Backend/app/Services/CheckoutService.php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Book;
use App\Events\OrderProcessed; // <-- Import Event kita
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- Import DB untuk Transaction
use Illuminate\Support\Facades\Storage; // <-- Import Storage untuk file

class CheckoutService
{
    /**
     * Memproses checkout user, membuat Order, dan Payment.
     * Ini adalah "otak" dari proses checkout.
     *
     * @param User $user User yang sedang login
     * @param array $data Data tervalidasi dari controller
     * @return Order
     * @throws \Exception
     */
    public function process(User $user, array $data)
    {
        // 1. Ambil keranjang user
        $cart = $user->cart;
        if (!$cart || $cart->items->isEmpty()) {
            throw new \Exception('Keranjang Anda kosong.');
        }

        // 2. Mulai "Janji" Transaksi Database
        $order = DB::transaction(function () use ($user, $cart, $data) {
            
            // 3. Hitung total harga ASLI dari keranjang (jangan percaya input user)
            $totalPrice = $cart->items->sum(function ($item) {
                return $item->price * $item->quantity;
            });

            // 4. Simpan file bukti pembayaran
            // $data['payment_proof'] adalah objek UploadedFile
            $filePath = $data['payment_proof']->store('payment_proofs', 'public');

            // 5. Buat entri Order
            $order = $user->orders()->create([
                'status' => 'pending', 
                'total_amount' => $totalPrice,
                'user_address_id' => $data['user_address_id'], // <-- [BENAR]
            ]);

            // 6. Buat entri Payment
            $order->payment()->create([
                'method' => 'qris_manual', // Sesuai permintaanmu
                'status' => 'waiting_validation', // Menunggu validasi admin
                'amount' => $data['amount_paid'], // Jumlah yang diinput user
                'payment_proof_url' => $filePath,
            ]);

            // 7. Pindahkan item dari Cart ke OrderItem
            foreach ($cart->items as $cartItem) {
                // Cek stok sekali lagi (penting!)
                $book = Book::findOrFail($cartItem->book_id);
                if ($book->stock < $cartItem->quantity) {
                    // Jika stok habis, Transaksi akan otomatis di-rollback
                    throw new \Exception('Stok untuk buku "' . $book->title . '" tidak mencukupi.');
                }

                $order->items()->create([
                    'book_id' => $cartItem->book_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price, // Ambil harga saat itu
                ]);
            }

            // 8. Kosongkan keranjang
            $cart->items()->delete();
            
            // 9. "Umumkan" ke sistem bahwa Order sudah diproses
            // Ini akan didengar oleh DecreaseStockListener
            event(new OrderProcessed($order));

            return $order;
        });

        return $order;
    }
}