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
            // FIX: Menggunakan whenNotNull() untuk penanganan null yang aman
            'name' => $this->whenNotNull('name'),
            'description' => $this->whenNotNull('description'),
            'created_at' => $this->created_at,
        ];
    }
}