<?php
// File: Backend/app/Models/UserAddress.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. Gunakan SoftDeletes

class UserAddress extends Model
{
    use HasFactory, SoftDeletes; // <-- 2. Aktifkan traits

    /**
     * Nama tabel.
     * (Sebenarnya tidak wajib jika nama model & tabel sudah sesuai,
     * tapi ini membuatnya lebih eksplisit)
     */
    protected $table = 'user_addresses';

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = [
        'user_id',
        // Disesuaikan dengan kolom pada migrasi terbaru
        'address_label',
        'recipient_name',
        'phone_number',
        'address_line',
        'city',
        'province',
        'postal_code',
        'is_primary',
    ];

    /**
     * Kolom yang harus di-cast ke tipe data tertentu.
     */
    protected $casts = [
        'is_primary' => 'boolean',
    ];

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    /**
     * Relasi N-1: Alamat ini dimiliki oleh seorang User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}