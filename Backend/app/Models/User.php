<?php
// File: Backend/app/Models/User.php

namespace App\Models;

// [PERUBAHAN 1] Impor contract MustVerifyEmail
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// [PERUBAHAN 2] Tambahkan 'implements MustVerifyEmail'
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    /**
     * Kolom yang boleh diisi secara massal.
     */
    protected $fillable = ['full_name','email','password','avatar','profile_image_url'];

    /**
     * Kolom yang harus disembunyikan.
     */
    protected $hidden = ['password','remember_token'];

    /**
     * Kolom yang harus di-cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) return asset('storage/'.$this->avatar);
        return $this->profile_image_url ?: null;
    }

    // =================================================================
    // RELASI ELOQUENT (Tidak berubah, sudah benar)
    // =================================================================

    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class, 'user_id', 'id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    public function cart()
    {
        return $this->hasOne(Cart::class, 'user_id', 'id');
    }
}