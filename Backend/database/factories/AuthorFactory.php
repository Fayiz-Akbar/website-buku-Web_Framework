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
        $faker = \Faker\Factory::create('id_ID');

        return [
            // Menggunakan 'name' (Kolom yang diasumsikan ada di tabel authors Anda)
            'name' => $faker->name(), 
            'bio' => $faker->paragraph(),
            // PENTING: Kolom 'slug' DIHAPUS untuk mencegah error SQLSTATE[42703]
        ];
    }
}