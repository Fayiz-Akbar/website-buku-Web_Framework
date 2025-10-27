<?php
// File: Backend/app/Models/Book.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Book extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'publisher_id',
        'title',
        'isbn',
        'description',
        'page_count',
        'published_year',
        'price',
        'stock',
        'cover_image_url',
        'cover_image', // pastikan ini ada jika digunakan
        'cover',
        'cover_path',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'page_count' => 'integer',
        'published_year' => 'integer',
        'stock' => 'integer',
    ];

    // Accessor tunggal untuk cover URL
    protected $appends = ['cover_url'];

    public function getCoverUrlAttribute(): ?string
    {
        // Prioritas: cover_image_url -> cover_image -> cover -> cover_path
        $path = $this->cover_image_url
            ?? $this->cover_image
            ?? $this->cover
            ?? $this->cover_path
            ?? null;

        // Tidak ada path, kembalikan default
        if (!$path || trim($path) === '') {
            return asset('images/default-book.jpg');
        }

        $path = ltrim($path, " \t\n\r\0\x0B/");

        // Jika sudah absolute URL, kembalikan langsung
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        // Jika file ada di storage, buat URL publik
        return url(Storage::url($path));
    }

    // =================================================================
    // RELASI ELOQUENT
    // =================================================================

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publisher::class, 'publisher_id', 'id');
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(Author::class, 'book_author', 'book_id', 'author_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'book_category', 'book_id', 'category_id');
    }
}
