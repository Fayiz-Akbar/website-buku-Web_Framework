<?php
// File: Backend/app/Models/Payment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    /**
     * Payment adalah catatan finansial.
     * Kita tidak menggunakan SoftDeletes di sini.
     */

   protected $fillable = [
        'order_id',
        'method',
        'status',
        'amount_due', // <-- [PERBAIKAN] Tambahkan ini
        'amount_paid', // <-- [PERBAIKAN] Tambahkan ini
        'payment_date', // <-- [PERBAIKAN] Tambahkan ini
        'payment_proof_url', // <-- [PERBAIKAN] Tambahkan ini
        // Tambahkan kolom lain jika ada (misal: transaction_id, etc.)
    ];

    /**
     * Kolom yang harus di-cast ke tipe data tertentu.
     */
    protected $casts = [
        'amount_due' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'paid_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi 1-1: Pembayaran ini adalah untuk satu Pesanan
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }
}