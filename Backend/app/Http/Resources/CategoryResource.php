<?php
// File: Backend/app/Http/Resources/CategoryResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // Perbaikan: Mengakses properti 'name' dari model ($this->name)
            'name' => $this->name,
            'description' => $this->whenNotNull($this->description),
            'created_at' => $this->created_at,
        ];
    }
}
