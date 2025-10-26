<?php
// File: Backend/app/Models/OrderItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * Order items tidak menggunakan SoftDeletes
     * karena mereka terikat pada 'orders' (jika order dihapus, item ikut).
     *
     * $timestamps juga diatur ke false JIKA kamu tidak membutuhkannya,
     * tapi migrasi kita membuatnya, jadi biarkan saja.
     */

    protected $fillable = [
        'order_id',
        'book_id',
        'quantity',
        'price',
        'snapshot_book_title', // <-- [PERBAIKAN] Tambahkan ini
        'snapshot_price_per_item',
    ];

    /**
     * Relasi N-1: Item ini milik satu Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    /**
     * Relasi N-1: Item ini merujuk ke satu Buku
     * Kita pakai withDefault() untuk menghindari error jika buku
     * aslinya sudah dihapus (karena kita pakai onDelete('set null'))
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id', 'id')->withDefault([
            'title' => '[Buku Dihapus]',
        ]);
    }
}