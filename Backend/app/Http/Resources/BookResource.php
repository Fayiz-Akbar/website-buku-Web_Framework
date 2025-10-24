<?php
// File: Backend/app/Http/Resources/BookResource.php

namespace App\Http\Resources; // Namespace default App\Http

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * Ini mendefinisikan struktur JSON yang akan dikirim ke React.
     * '$this' merujuk pada objek Model Book yang sedang diproses.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Kita gunakan $this->resource untuk mengakses properti model
        $book = $this->resource;

        return [
            // 1. Pilih kolom yang ingin ditampilkan
            'id' => $book->id, // Menggunakan ID standar Eloquent
            'title' => $book->title,
            'isbn' => $book->isbn,
            'description' => $book->description,
            'page_count' => $book->page_count,
            'published_year' => $book->published_year,
            'price' => (float) $book->price, // Cast ke float untuk JSON
            'stock' => $book->stock,
            'cover_image_url' => $book->cover_image_url,

            // 2. Format Relasi (Memanggil Resource lain)
            // 'whenLoaded' memastikan relasi hanya dimuat jika
            // kita melakukan eager loading di Controller (PENTING untuk performa)
            'publisher' => PublisherResource::make($this->whenLoaded('publisher')),
            'authors' => AuthorResource::collection($this->whenLoaded('authors')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),

            // 3. (Opsional) Tambahkan metadata atau data olahan
            // 'is_in_stock' => $book->stock > 0,
            // 'formatted_price' => 'Rp ' . number_format($book->price, 0, ',', '.'),

            // 4. (Opsional) Sembunyikan timestamps jika tidak perlu di frontend
            // 'created_at' => $book->created_at,
            // 'updated_at' => $book->updated_at,
        ];
    }
}