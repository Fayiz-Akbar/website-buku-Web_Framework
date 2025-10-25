<?php
// File: Backend/app/Http/Resources/AuthorResource.php

namespace App\Http\Resources; // Namespace default App\Http

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     * Hanya menampilkan data yang relevan dari Author.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            // Kita bisa sembunyikan 'bio', 'created_at', dll.
        ];
    }
}