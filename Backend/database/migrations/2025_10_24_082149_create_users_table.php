<?php
// File: Backend/database/migrations/0001_01_01_000000_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Primary Key (bigint auto-increment)
            $table->string('full_name'); // Mengganti 'name' menjadi 'full_name'
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password'); // Akan di-hash oleh Laravel
            $table->enum('role', ['admin', 'user'])->default('user'); // Kolom Role
            $table->string('profile_image_url')->nullable();
            $table->string('avatar')->nullable();
            $table->rememberToken();
            $table->timestamps(); // created_at dan updated_at
            $table->softDeletes(); // Kolom deleted_at (untuk soft delete)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};