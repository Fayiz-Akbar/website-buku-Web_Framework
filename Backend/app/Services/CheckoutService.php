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
use Illuminate\Support\Str;

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
            $orderCode = 'ORD-' . strtoupper(Str::random(8));
            // 5. Buat entri Order
            $order = $user->orders()->create([
                'user_id' => $user->id, // [PERBAIKAN] Explisit tambahkan user_id
                'user_address_id' => $data['user_address_id'],
                'order_code' => $orderCode,
                'status' => 'pending',
                'total_items_price' => $totalPrice, // <-- [PERBAIKAN] Nama kolom yang benar
                'discount_amount' => 0, // <-- [PERBAIKAN] Default value
                'final_amount' => $totalPrice, // <-- [PERBAIKAN] Asumsikan final = total (belum ada diskon/ongkir)
            ]);

            // 6. Buat entri Payment
            $order->payment()->create([
                'order_id' => $order->id, // [PERBAIKAN] Explisit tambahkan order_id
                'method' => 'qris_manual',
                'status' => 'waiting_validation',
                'amount_due' => $order->final_amount, // <-- [PERBAIKAN] Jumlah yang HARUS dibayar
                'amount_paid' => $data['amount_paid'], // Jumlah yang DIINPUT user
                'payment_proof_url' => $filePath,
                'payment_date' => now(), // [PERBAIKAN] Tambahkan tanggal pembayaran (opsional tapi bagus)
            ]);

            // 7. Pindahkan item dari Cart ke OrderItem
            foreach ($cart->items as $cartItem) {
                // Cek stok sekali lagi (penting!)
                $book = Book::findOrFail($cartItem->book_id);
                if ($book->stock < $cartItem->quantity) {
                    // Jika stok habis, Transaksi akan otomatis di-rollback
                    throw new \Exception('Stok untuk buku "' . $book->title . '" tidak mencukupi.');
                }

                if (is_null($cartItem->price)) {
                throw new \Exception('Harga untuk item keranjang ID: ' . $cartItem->id . ' (Buku: ' . $book->title . ') tidak ditemukan. Coba hapus dan tambahkan ulang ke keranjang.');
            }

            $order->items()->create([
                'book_id'    => $cartItem->book_id,
                'quantity'   => $cartItem->quantity,
                
                // BUG FIX 1: 'price' adalah harga total (kuantitas * harga satuan)
                'price'      => $cartItem->quantity * $cartItem->price, 
                
                // Snapshot data buku
                'snapshot_book_title' => $cartItem->book->title,
                
                // BUG FIX 2 (Penyebab error-mu): Tambahkan harga satuan
                'snapshot_price_per_item' => $cartItem->price,
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