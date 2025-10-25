<?php
// File: Backend/database/factories/BookFactory.php

namespace Database\Factories;

use App\Models\Publisher; // <-- Import Publisher
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // publisher_id akan kita atur di Seeder
            // 'publisher_id' => Publisher::factory(), // Atau buat publisher baru di sini
            'title' => fake()->sentence(3),
            'isbn' => fake()->optional()->isbn13(),
            'description' => fake()->paragraph(),
            'page_count' => fake()->numberBetween(50, 1000),
            'published_year' => fake()->numberBetween(1900, now()->year),
            // Tambahkan price dan stock
            'price' => fake()->randomFloat(2, 10000, 500000), // Harga antara 10rb - 500rb
            'stock' => fake()->numberBetween(0, 100), // Stok antara 0 - 100
            'cover_image_url' => fake()->optional()->imageUrl(400, 600, 'books'), // URL gambar dummy
        ];
    }
}