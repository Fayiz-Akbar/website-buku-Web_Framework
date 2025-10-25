<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Book; // <-- PASTIKAN Model Book Anda ada dan di-import
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. HAPUS DATA LAMA UNTUK MENGHINDARI DUPLIKAT DAN KONFLIK
        Book::truncate(); 
        User::truncate();
        
        // 2. SEED DATA BUKU (300 record) UNTUK MENGUJI PAGINASI
        // Catatan: Pastikan Anda sudah menjalankan 'php artisan make:factory BookFactory'
        Book::factory()->count(300)->create();
        
        // 3. SEED DATA PENGGUNA UNTUK LOGIN ADMIN
        User::factory()->create([
            'name' => 'Admin Toko Buku',
            'email' => 'admin@mail.com', // <-- Kredensial Admin untuk Frontend React
            'password' => bcrypt('password'), // Password: 'password'
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'), 
        ]);
    }
}
