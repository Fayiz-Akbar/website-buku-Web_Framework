<?php

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
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'amount_due' => $this->amount_due,
            'amount_paid' => $this->amount_paid,
            'proof_image_url' => $this->proof_image_url,
            'admin_notes' => $this->admin_notes,
            'paid_at' => $this->paid_at,
            'confirmed_at' => $this->confirmed_at,
        ];
    }
}