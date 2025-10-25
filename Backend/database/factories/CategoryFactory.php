<?php

namespace Database\Factories;

use Illuminate\Support\Str;
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
        // [PERBAIKAN] Kita hanya siapkan default factory
        // Seeder kita akan menimpa (override) nilai 'name' ini
        $faker = \Faker\Factory::create('id_ID');
        
        // Buat nama acak 2 kata sebagai default
        $name = $faker->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name, '-'),
        ];
    }
}