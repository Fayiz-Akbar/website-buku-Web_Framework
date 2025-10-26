<?php
// File: Backend/database/migrations/2025_10_24_082327_create_books_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();

            // Relasi ke publisher (satu penerbit punya banyak buku)
            $table->foreignId('publisher_id')->nullable()->constrained('publishers')->nullOnDelete();

            // Informasi buku
            $table->string('title');
            $table->string('isbn')->unique()->nullable();
            $table->text('description')->nullable();
            $table->integer('page_count')->nullable()->unsigned();
            $table->integer('published_year')->nullable();

            // Harga dan stok
            $table->decimal('price', 12, 2)->default(0.00);
            $table->decimal('original_price', 12, 2)->nullable(); // ✅ Tambahan kolom ini
            $table->integer('stock')->default(0);

            // Gambar cover
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
