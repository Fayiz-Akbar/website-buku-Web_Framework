<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
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

            'total_amount' => $this->final_amount,
            'final_amount' => $this->final_amount,
            'total_items_price' => $this->total_items_price,
            'shipping_cost' => $this->shipping_cost,
            'discount_amount' => $this->discount_amount,
            'created_at' => $this->created_at,

            // Hapus UserResource agar tidak error
            'user_id' => $this->user_id,
            'address' => new UserAddressResource($this->whenLoaded('address')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
