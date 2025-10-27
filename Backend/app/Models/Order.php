<?php

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
        'user_address_id',
        'order_code',
        'status',
        'total_items_price',
        'discount_amount',
        'shipping_cost',
        'final_amount',
        'shipping_notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(UserAddress::class, 'user_address_id', 'id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'id');
    }
}