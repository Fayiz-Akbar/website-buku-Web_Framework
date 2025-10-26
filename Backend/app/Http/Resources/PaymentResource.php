<?php
// File: Backend/app/Http/Resources/PaymentResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'method' => $this->method,
            'status' => $this->status,
            'amount_due' => (float) $this->amount_due,
            // FIX: Cast amount_paid ke float dan pastikan tidak NULL
            'amount_paid' => (float) $this->amount_paid, 
            'payment_date' => $this->whenNotNull('payment_date'), // Menggunakan whenNotNull
            
            // FIX KRITIS: Menggunakan whenNotNull untuk kolom yang mungkin NULL
            'payment_proof_url' => $this->whenNotNull('payment_proof_url'), 
            'transaction_id' => $this->whenNotNull('transaction_id'),
            'admin_notes' => $this->whenNotNull('admin_notes'),
            'paid_at' => $this->whenNotNull('paid_at'),
            'confirmed_at' => $this->whenNotNull('confirmed_at'),

            'created_at' => $this->created_at,
        ];
    }
}