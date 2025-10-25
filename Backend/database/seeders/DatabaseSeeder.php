<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Publisher;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str; // [PERBAIKAN] Import Str untuk slug

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
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // 2. Buat User Biasa
        User::factory()->create([
            'full_name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // 3. [PERBAIKAN] Buat 15 Kategori secara deterministik (pasti)
        
        // Daftar nama kategori yang kita inginkan
        $categoryNames = [
            'Novel', 'Komik', 'Biografi', 'Pengembangan Diri', 'Sains',
            'Teknologi', 'Sejarah', 'Agama', 'Pendidikan', 'Anak-Anak',
            'Fiksi Ilmiah', 'Horor', 'Misteri', 'Romansa', 'Bisnis'
        ];

        // Ubah array nama menjadi array sequence untuk factory
        // ['Novel'] -> ['name' => 'Novel', 'slug' => 'novel']
        $categorySequence = collect($categoryNames)->map(fn ($name) => [
            'name' => $name,
            'slug' => Str::slug($name, '-')
        ])->all();

        // Panggil factory 15 kali, dan gunakan sequence yang sudah kita buat
        // Ini akan memakai data dari $categorySequence satu per satu, urut
        $categories = Category::factory()->count(15)->sequence(...$categorySequence)->create();


        // 4. Buat Penulis (Misal kita buat 50 penulis)
        $authors = Author::factory(50)->create();

        // 5. Buat Penerbit (Misal kita buat 20 penerbit)
        $publishers = Publisher::factory(20)->create();

        // 6. Buat 200 Buku (Kode ini sudah benar)
        Book::factory(200)->create()->each(function ($book) use ($authors, $categories, $publishers) {
            
            $book->publisher_id = $publishers->random()->id;
            $book->save(); 

            $book->authors()->attach(
                $authors->random(rand(1, 3))->pluck('id')->toArray()
            );

            $book->categories()->attach(
                $categories->random(rand(1, 2))->pluck('id')->toArray()
            );
        });
    }
}