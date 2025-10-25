<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Author>
 */
class AuthorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Menggunakan lokal Indonesia untuk generator Faker
        $faker = \Faker\Factory::create('id_ID');

        return [
            // Membuat nama orang Indonesia
            'name' => $faker->name(),
            // Membuat biografi singkat palsu
            'bio' => $faker->paragraph(3),
        ];
    }
}