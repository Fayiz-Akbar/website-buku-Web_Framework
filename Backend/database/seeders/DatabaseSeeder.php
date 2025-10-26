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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1️⃣ Buat User Admin & User Biasa
        $userAdmin = User::factory()->create([
            'full_name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password')
        ]);

        $userBiasa = User::factory()->create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'user',
            'password' => Hash::make('password')
        ]);

        UserAddress::factory(3)->create([
            'user_id' => $userBiasa->id,
            'is_primary' => fake()->boolean(40)
        ]);

        // 2️⃣ Baca Data dari JSON
        $jsonPath = database_path('data/books_data.json');
        if (!File::exists($jsonPath)) {
            echo "❌ ERROR: File JSON data buku tidak ditemukan di: " . $jsonPath . "\n";
            return;
        }

        $bookData = json_decode(File::get($jsonPath), true);

        $publishersMap = collect();
        $authorsMap = collect();
        $categoriesMap = collect();

        // 3️⃣ Buat Publisher, Author, Category dari JSON
        foreach ($bookData as $data) {
            // Publisher
            $publisherName = $data['publisher'];
            if (!$publishersMap->has($publisherName)) {
                $publisher = Publisher::firstOrCreate(
                    ['name' => $publisherName]
                );
                $publishersMap->put($publisherName, $publisher);
            }

            // Author
            $authorName = $data['author'];
            if (!$authorsMap->has($authorName)) {
                $author = Author::firstOrCreate(
                    ['name' => $authorName],
                    ['bio' => fake()->paragraph()]
                );
                $authorsMap->put($authorName, $author);
            }

            // Category (✨ fix slug not null)
            foreach ($data['category'] as $categoryName) {
                if (!$categoriesMap->has($categoryName)) {
                    $category = Category::firstOrCreate(
                        ['name' => $categoryName],
                        ['slug' => Str::slug($categoryName)] // auto generate slug
                    );
                    $categoriesMap->put($categoryName, $category);
                }
            }
        }

        // 4️⃣ Buat Data Tambahan Dummy
        $authors = Author::factory(30)->create();
        $publishers = Publisher::factory(10)->create();

        // 5️⃣ Buat Buku dari JSON (TANPA DUPLICATE ISBN)
        $categories = $categoriesMap->values();
        $authorsFromFactory = $authorsMap->values();

        foreach ($bookData as $data) {
            // Cek apakah buku dengan ISBN ini sudah ada
            $existingBook = Book::where('isbn', $data['isbn'])->first();
            
            if (!$existingBook) {
                $book = Book::create([
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'isbn' => $data['isbn'],
                    'page_count' => fake()->numberBetween(200, 500),
                    'published_year' => $data['publication_year'],
                    'price' => $data['price'],
                    'stock' => $data['stock'],
                    'cover_image_url' => $data['image'],
                    'publisher_id' => $publishersMap->get($data['publisher'])->id,
                ]);

                // Hubungkan Author (dari JSON)
                $author = $authorsMap->get($data['author']);
                $book->authors()->attach($author->id);

                // Hubungkan Categories
                $categoryIds = collect($data['category'])->map(function ($c) use ($categoriesMap) {
                    return $categoriesMap->get($c)->id;
                });
                $book->categories()->sync($categoryIds);
            }
        }

        // 6️⃣ Buat buku dummy tambahan (gunakan BookFactory)
        Book::factory(20)->create()->each(function ($dummyBook) use ($categories, $authors) {
            $dummyBook->authors()->attach($authors->random(1)->first()->id);
            $dummyBook->categories()->attach($categories->random(1)->first()->id);
        });

        echo "✅ Database seeding selesai! Total buku dari JSON: " . count($bookData) . "\n";
    }
}