<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Publisher>
 */
class PublisherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Menggunakan lokal Indonesia
        $faker = \Faker\Factory::create('id_ID');
        
        return [
            // Membuat nama perusahaan/penerbit Indonesia
            'name' => $faker->unique()->company(), // Kita tambahkan unique() di sini
            
            // [PERBAIKAN] Hapus baris ini karena kolom 'address'
            // tidak ada di file migrasi ..._create_publishers_table.php
            // 'address' => $faker->address(), 
        ];
    }
}