<?php

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
            'total_amount' => $this->total_amount,
            'created_at' => $this->created_at,
            
            // Data relasi (akan di-load sesuai kebutuhan)
            'user' => new UserResource($this->whenLoaded('user')),
            
            // SUDAH DISESUAIKAN: Menggunakan relasi 'address'
            'address' => new UserAddressResource($this->whenLoaded('address')), 
            
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}