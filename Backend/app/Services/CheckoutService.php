<?php
// File: Backend/app/Services/CheckoutService.php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Book;
use App\Models\CartItem; // <-- [PERUBAHAN 1] Import CartItem
use App\Events\OrderProcessed; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Storage; 
use Illuminate\Support\Str;

class CheckoutService
{
    /**
     * Memproses checkout user, membuat Order, dan Payment.
     *
     * @param User $user User yang sedang login
     * @param array $data Data tervalidasi dari controller (termasuk 'items')
     * @return Order
     * @throws \Exception
     */
    public function process(User $user, array $data)
    {
        // [PERUBAHAN 2] Ambil ID item yang dipilih dari $data
        $selectedItemIds = $data['items'];
        $cart = $user->cart;

        // 1. Ambil HANYA item yang dipilih dari keranjang user
        $itemsToProcess = $cart->items()
                               ->with('book') // Eager load buku untuk cek stok
                               ->whereIn('id', $selectedItemIds)
                               ->get();

        // Pastikan item yang dipilih ada
        if ($itemsToProcess->isEmpty()) {
            throw new \Exception('Tidak ada item yang dipilih untuk checkout.');
        }
        
        // Pastikan jumlah item yang ditemukan di DB sama dengan yang diminta
        // (Mencegah jika ada item yang sudah dihapus di tab lain)
        if (count($selectedItemIds) !== $itemsToProcess->count()) {
             throw new \Exception('Beberapa item di keranjang tidak ditemukan. Muat ulang halaman.');
        }


        // 2. Mulai Transaksi Database
        $order = DB::transaction(function () use ($user, $itemsToProcess, $data) {
            
            // 3. Hitung total harga HANYA dari item yang dipilih
            $totalPrice = $itemsToProcess->sum(function ($item) {
                // Pastikan harga ada
                if (is_null($item->price)) {
                     throw new \Exception('Harga untuk buku "' . $item->book->title . '" tidak valid.');
                }
                return $item->price * $item->quantity;
            });

            // 4. Simpan file bukti pembayaran
            $filePath = $data['payment_proof']->store('payment_proofs', 'public');
            $orderCode = 'ORD-' . strtoupper(Str::random(8));

            // 5. Buat entri Order (menggunakan $totalPrice yang baru)
            $order = $user->orders()->create([
                'user_id' => $user->id, 
                'user_address_id' => $data['user_address_id'],
                'order_code' => $orderCode,
                'status' => 'pending',
                'total_items_price' => $totalPrice, 
                'discount_amount' => 0, 
                'final_amount' => $totalPrice, 
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

            // 7. Pindahkan HANYA item yang dipilih dari Cart ke OrderItem
            foreach ($itemsToProcess as $cartItem) {
                // Cek stok sekali lagi
                $book = $cartItem->book; // Ambil dari eager load
                if ($book->stock < $cartItem->quantity) {
                    throw new \Exception('Stok untuk buku "' . $book->title . '" tidak mencukupi.');
                }

                // (Pengecekan harga sudah di Poin 3)

                $order->items()->create([
                    'book_id'    => $cartItem->book_id,
                    'quantity'   => $cartItem->quantity,
                    'price'      => $cartItem->quantity * $cartItem->price, 
                    'snapshot_book_title' => $cartItem->book->title,
                    'snapshot_price_per_item' => $cartItem->price,
                ]);
            }

            // 8. Hapus HANYA item yang sudah di-checkout dari keranjang
            // (Jangan kosongkan semua keranjang!)
            CartItem::whereIn('id', $itemsToProcess->pluck('id'))->delete();
            
            // 9. "Umumkan" ke sistem bahwa Order sudah diproses
            event(new OrderProcessed($order));

            return $order;
        });

        return $order;
    }
}