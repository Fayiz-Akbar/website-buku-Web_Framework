<?php
// File: Backend/app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'user_address_id', // <-- Pindahkan ke atas agar rapi
        'order_code',
        'status',
        'total_items_price', // <-- [PERBAIKAN] Tambahkan ini
        'discount_amount',
        'final_amount',
        'shipping_notes',
    ];

    /**
     * Relasi N-1: Pesanan ini dimiliki oleh seorang User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Relasi N-1: Pesanan ini dikirim ke satu Alamat
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(UserAddress::class, 'user_address_id', 'id');
    }

    /**
     * Relasi 1-N: Pesanan ini memiliki banyak Item
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }

    /**
     * Relasi 1-1: Pesanan ini memiliki satu Pembayaran
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'id');
    }
}