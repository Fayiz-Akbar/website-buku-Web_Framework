<?php
// File: Backend/app/Http/Resources/OrderResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
// Import resource lain yang kita butuhkan
use App\Http\Resources\UserResource;
use App\Http\Resources\UserAddressResource;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\OrderItemResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_code' => $this->order_code,
            'status' => $this->status,
            
            // FIX KRITIS: Menyediakan final_amount untuk kunci 'total_amount' (diperlukan list view)
            'total_amount' => $this->final_amount, 
            // Menyediakan final_amount untuk kunci 'final_amount' (diperlukan detail view)
            'final_amount' => $this->final_amount, 
            
            // Kolom harga lain yang mungkin dibutuhkan detail view
            'total_items_price' => $this->total_items_price,
            'shipping_cost' => $this->shipping_cost,
            'discount_amount' => $this->discount_amount,
            
            'created_at' => $this->created_at,
            
            // Data relasi (sudah defensif)
            'user' => new UserResource($this->whenLoaded('user')),
            'address' => new UserAddressResource($this->whenLoaded('address')), 
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}