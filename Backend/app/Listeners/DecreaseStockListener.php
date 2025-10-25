<?php
// File: Backend/app/Listeners/DecreaseStockListener.php

namespace App\Listeners;

use App\Events\OrderProcessed;
use App\Models\Book; // <-- Import Book
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log; // <-- Import Log

class DecreaseStockListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     * Ini akan dipanggil otomatis oleh Laravel
     * setiap kali 'OrderProcessed' di-dispatch.
     */
    public function handle(OrderProcessed $event): void
    {
        // $event->order berisi data order dari CheckoutService
        $order = $event->order;

        try {
            // Loop setiap item dalam order
            foreach ($order->items as $item) {
                // Cari buku-nya
                $book = Book::find($item->book_id);
                
                if ($book) {
                    // Kurangi stok
                    $book->stock -= $item->quantity;
                    $book->save();
                }
            }
        } catch (\Exception $e) {
            // Catat jika ada error saat pengurangan stok
            Log::error('Gagal mengurangi stok untuk Order ID: ' . $order->id . ' - Error: ' . $e->getMessage());
        }
    }
}