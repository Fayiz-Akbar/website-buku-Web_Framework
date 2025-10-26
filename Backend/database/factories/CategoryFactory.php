<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = \Faker\Factory::create('id_ID');
        
        // Daftar kategori realistis untuk FAKER
        $categories = [
            'Fiksi', 'Non-Fiksi', 'Bisnis', 'Teknologi',
            'Pengembangan Diri', 'Sejarah', 'Sains', 'Novel'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($categories),
            // PENTING: Kolom 'slug' DIHAPUS karena melanggar NOT NULL di migrasi Anda
        ];
    }
}