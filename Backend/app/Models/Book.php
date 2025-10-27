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

    // pastikan properti ini ada agar cover_url ikut terserialisasi ke JSON
    protected $appends = [
        'cover_url',
        'author_name',
        'category_name',
    ];

    public function getCoverUrlAttribute()
    {
        // urutan prioritas: URL eksternal -> absolute URL -> file di storage
        $external = $this->attributes['cover_image_url'] ?? null;
        if ($external) {
            return $external;
        }

        $path = $this->attributes['cover_image']
            ?? $this->attributes['cover']
            ?? $this->attributes['cover_path']
            ?? null;

        if (!$path) {
            return null;
        }

        // jika sudah absolute url, kembalikan apa adanya
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        // buat URL publik dari storage, lalu jadikan absolute
        $relative = Storage::url($path);        // contoh: /storage/covers/abc.jpg
        return url($relative);                  // contoh: http://127.0.0.1:8000/storage/covers/abc.jpg
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

    // Selalu muat relasi agar tampil di JSON (list/detail/store/update)
    protected $with = ['author', 'category'];

    // Mudahkan frontend dengan field datar
    
    public function author()
    {
        return $this->belongsTo(Author::class)->withDefault([
            'name' => null,
        ]);
    }

    public function category()
    {
        return $this->belongsTo(Category::class)->withDefault([
            'name' => null,
        ]);
    }

    public function getAuthorNameAttribute()
    {
        return $this->author?->name;
    }

    public function getCategoryNameAttribute()
    {
        return $this->category?->name;
    }
}
