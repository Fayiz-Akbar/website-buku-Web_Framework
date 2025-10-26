<?php
// File: Backend/app/Models/CartItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    /**
     * Item keranjang (cart item) terikat pada Cart.
     * Jika Cart dihapus, item ikut terhapus (sesuai onDelete('cascade')).
     * Tidak perlu SoftDeletes.
     */

    protected $fillable = [
        'cart_id',
        'book_id',
        'quantity',
        'price',
    ];

    /**
     * Kolom yang harus di-cast.
     */
    protected $casts = [
        'quantity' => 'integer',
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi N-1: Item ini adalah bagian dari satu Keranjang
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_id', 'id');
    }

    /**
     * Relasi N-1: Item ini merujuk ke satu Buku
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'book_id', 'id');
    }
}