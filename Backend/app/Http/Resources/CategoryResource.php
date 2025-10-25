<?php
// File: Backend/app/Http/Resources/CategoryResource.php

namespace App\Http\Resources; // Namespace default App\Http

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
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'slug' => $this->resource->slug, // Slug mungkin berguna untuk link di frontend
        ];
    }
}