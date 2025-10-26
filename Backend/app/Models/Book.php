<?php
// File: Backend/app/Models/Book.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes; 

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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'page_count' => 'integer',
        'published_year' => 'integer',
        'stock' => 'integer',
    ];
    
    // FIX KRITIS #1: Tambahkan Accessor ke Model
    // Accessor ini akan membuat kunci 'cover_url' tersedia
    public function getCoverUrlAttribute(): ?string
    {
        // Memberikan URL publik lengkap (url('storage/path/to/file'))
        if ($this->cover_image_url) {
            return url('storage/' . $this->cover_image_url);
        }
        
        // Mengembalikan null secara eksplisit jika gambar tidak ada (defensif)
        return null; 
    }
    
    // FIX KRITIS #2: Tambahkan 'cover_url' ke $appends agar selalu disertakan
    // Ini memastikan resource dapat mengaksesnya.
    protected $appends = [
        'cover_url', 
    ];


    // =================================================================
    // RELASI ELOQUENT (Sama seperti sebelumnya)
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