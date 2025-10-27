<?php
// File: Backend/app/Http/Resources/BookResource.php

namespace App\Http\Resources; 

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        $book = $this->resource;

        return [
            // 1. Kolom Dasar
            'id' => $book->id,
            'title' => $book->title,
            'isbn' => $book->isbn,
            'description' => $book->description,
            'page_count' => $book->page_count,
            'published_year' => $book->published_year,
            'price' => (float) $book->price,
            'stock' => $book->stock,

            // gunakan accessor yang sudah benar
            'cover_url' => $book->cover_url, 

            // 2. Relasi (Sudah menggunakan whenLoaded yang benar)
            'publisher' => PublisherResource::make($this->whenLoaded('publisher')),
            'authors' => AuthorResource::collection($this->whenLoaded('authors')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}