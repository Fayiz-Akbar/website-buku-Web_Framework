<?php
// File: Backend/app/Http/Resources/PublisherResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublisherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            // Perbaikan: Mengakses properti 'name' dari model ($this->name)
            // Menggunakan whenNotNull($this->name) hanya jika Anda ingin properti 'name' 
            // TIDAK muncul dalam JSON sama sekali jika nilainya null. 
            // Karena nama harus ada, kita gunakan langsung $this->name.
            'name' => $this->name, 
            'description' => $this->whenNotNull($this->description),
            'created_at' => $this->created_at,
        ];
    }
}
