<?php
// File: Backend/database/seeders/DatabaseSeeder.php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Author;
use App\Models\Publisher;
use App\Models\Category;
use App\Models\Book;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat User Admin
        User::factory()->create([
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin', // Set role admin
            // Password default adalah 'password' (dari UserFactory)
        ]);

        // 2. Buat User Biasa
        $userBiasa = User::factory()->create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'user',
        ]);

        // 3. Buat Alamat untuk User Biasa
        UserAddress::factory()->create([
            'user_id' => $userBiasa->id,
            'is_primary' => true,
        ]);
        // Buat beberapa alamat tambahan (opsional)
        UserAddress::factory(2)->create([
            'user_id' => $userBiasa->id,
            'is_primary' => false,
        ]);


        // 4. Buat Data Master
        // Pastikan kita punya cukup data untuk relasi
        $authors = Author::factory(10)->create();
        $publishers = Publisher::factory(5)->create();
        $categories = Category::factory(8)->create();

        // 5. Buat Buku dan Lampirkan Relasi
        // Pastikan Publisher tidak kosong sebelum loop
        if ($publishers->isEmpty()) {
             // Handle jika tidak ada publisher, mungkin buat satu default
             $publishers = collect([Publisher::factory()->create(['name' => 'Default Publisher'])]);
        }
        
        Book::factory(30) // Buat 30 buku
            ->recycle($publishers) // Gunakan publisher yang ada secara acak
            ->create()
            ->each(function (Book $book) use ($authors, $categories) {
                // Lampirkan 1-3 penulis acak
                if ($authors->isNotEmpty()) {
                    $book->authors()->attach(
                        $authors->random(rand(1, min(3, $authors->count())))->pluck('id')->toArray()
                    );
                }
                // Lampirkan 1-2 kategori acak
                if ($categories->isNotEmpty()) {
                    $book->categories()->attach(
                        $categories->random(rand(1, min(2, $categories->count())))->pluck('id')->toArray()
                    );
                }
        });
    }
}