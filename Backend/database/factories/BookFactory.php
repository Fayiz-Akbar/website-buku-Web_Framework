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
        $faker = \Faker\Factory::create('id_ID');
        return [
            // publisher_id akan kita atur di Seeder
            // 'publisher_id' => Publisher::factory(), // Atau buat publisher baru di sini
            'title' => $faker->sentence(rand(3, 7)),       // Judul Bahasa Indonesia
            'description' => $faker->paragraphs(3, true), // Deskripsi Bahasa Indonesia
            'isbn' => fake()->isbn13(),
            'page_count' => fake()->numberBetween(50, 1000),
            'published_year' => fake()->numberBetween(1900, now()->year),
            // Kolom lain sudah benar
            'price' => $faker->numberBetween(50000, 200000),
            'stock' => $faker->numberBetween(10, 100),
            'cover_image_url' => fake()->optional()->imageUrl(400, 600, 'books'), // URL gambar dummy
        ];
    }
}