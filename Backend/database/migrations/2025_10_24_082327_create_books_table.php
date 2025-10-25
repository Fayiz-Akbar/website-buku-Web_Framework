<?php
// File: Backend/database/migrations/...._create_books_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // File: Backend/database/migrations/...._create_books_table.php

public function up(): void
{
    Schema::create('books', function (Blueprint $table) {
        $table->id();
        
        // HANYA relasi publisher_id (one-to-many)
        $table->foreignId('publisher_id')->nullable()->constrained('publishers')->nullOnDelete();
        
        // author_id dan category_id DIHAPUS
        
        $table->string('title');
        $table->string('isbn')->unique()->nullable();
        $table->text('description')->nullable();
        $table->integer('page_count')->nullable()->unsigned();
        $table->integer('published_year')->nullable();
        
        $table->decimal('price', 12, 2)->default(0.00);
        $table->integer('stock')->default(0);
        
        // Ganti nama kolom ini agar cocok dengan controller
        $table->string('cover_image_url')->nullable(); 
        
        $table->timestamps();
        $table->softDeletes();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};