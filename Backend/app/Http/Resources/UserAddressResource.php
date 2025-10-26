<?php
// File: Backend/app/Http/Resources/UserAddressResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAddressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // Menggunakan whenNotNull() secara defensif untuk semua string
            'address_label' => $this->whenNotNull('address_label'),
            'recipient_name' => $this->whenNotNull('recipient_name'),
            'phone_number' => $this->whenNotNull('phone_number'),
            'address_line' => $this->whenNotNull('address_line'),
            'city' => $this->whenNotNull('city'),
            'province' => $this->whenNotNull('province'),
            'postal_code' => $this->whenNotNull('postal_code'),
            'is_primary' => (bool) $this->is_primary, 
            'created_at' => $this->created_at,
        ];
    }
}