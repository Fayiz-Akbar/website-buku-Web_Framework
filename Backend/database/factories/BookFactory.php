<?php
// File: Backend/database/factories/BookFactory.php

namespace Database\Factories;

use App\Models\Publisher; 
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    // Static property untuk tracking ISBN yang sudah dipakai (untuk dummy books)
    private static $usedIsbns = [];
    
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = \Faker\Factory::create('id_ID');

        // --- DATA BUKU DUMMY (untuk buku tambahan di luar JSON) ---
        $dummyBooks = [
            ['title' => 'Pemrograman Web Modern', 'author' => 'Dummy Author 1', 'seed' => 'web programming'],
            ['title' => 'Database Design Patterns', 'author' => 'Dummy Author 2', 'seed' => 'database book'],
            ['title' => 'Artificial Intelligence Basics', 'author' => 'Dummy Author 3', 'seed' => 'ai book'],
            ['title' => 'Cloud Computing Essentials', 'author' => 'Dummy Author 4', 'seed' => 'cloud book'],
            ['title' => 'Mobile App Development', 'author' => 'Dummy Author 5', 'seed' => 'mobile dev'],
            ['title' => 'Cybersecurity Fundamentals', 'author' => 'Dummy Author 6', 'seed' => 'security book'],
            ['title' => 'Data Science with R', 'author' => 'Dummy Author 7', 'seed' => 'data science'],
            ['title' => 'DevOps Handbook', 'author' => 'Dummy Author 8', 'seed' => 'devops book'],
            ['title' => 'Digital Marketing Strategy', 'author' => 'Dummy Author 9', 'seed' => 'marketing book'],
            ['title' => 'Blockchain Technology', 'author' => 'Dummy Author 10', 'seed' => 'blockchain book'],
        ];
        
        $selectedBook = $this->faker->randomElement($dummyBooks);
        
        // Buat ISBN unik (pastikan tidak duplikat)
        do {
            $isbn = $this->faker->unique()->isbn13();
        } while (in_array($isbn, self::$usedIsbns));
        
        self::$usedIsbns[] = $isbn;
        
        $publisherId = Publisher::inRandomOrder()->first()?->id;

        return [
            'title' => $selectedBook['title'] . ' ' . $faker->numberBetween(1, 100), // Tambah nomor agar unique
            'description' => $faker->paragraphs(3, true), 
            'isbn' => $isbn,
            'page_count' => $faker->numberBetween(150, 800),
            'published_year' => $faker->numberBetween(2015, now()->year),
            'price' => $faker->numberBetween(60000, 500000),
            'stock' => $faker->numberBetween(10, 100),
            
            // Gunakan Picsum untuk dummy books (biar beda dari JSON books)
            'cover_image_url' => 'https://picsum.photos/seed/' . Str::slug($selectedBook['seed']) . $isbn . '/400/600', 
            
            'publisher_id' => $publisherId ?? Publisher::factory(),
        ];
    }
    
    public function configure()
    {
        // Data Author untuk dummy books
        $dummyAuthors = [
            'Dummy Author 1', 'Dummy Author 2', 'Dummy Author 3', 
            'Dummy Author 4', 'Dummy Author 5', 'Dummy Author 6',
            'Dummy Author 7', 'Dummy Author 8', 'Dummy Author 9', 'Dummy Author 10'
        ];

        return $this->afterCreating(function (\App\Models\Book $book) use ($dummyAuthors) {
            
            // Cek apakah sudah ada author yang di-attach dari seeder
            if ($book->authors()->count() === 0) {
                // Jika belum, buat author random
                $authorName = $this->faker->randomElement($dummyAuthors);
                $author = \App\Models\Author::firstOrCreate(
                    ['name' => $authorName],
                    ['bio' => fake()->paragraph()] 
                );
                $book->authors()->attach($author->id);
            }
        });
    }
}