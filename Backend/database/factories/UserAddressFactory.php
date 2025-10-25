<?php
// File: Backend/database/factories/UserAddressFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserAddress>
 */
class UserAddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Gunakan lokal Indonesia
        $faker = \Faker\Factory::create('id_ID');

        return [
            // user_id akan kita atur dari Seeder
            'address_label' => $faker->randomElement(['Rumah', 'Kantor']),
            'recipient_name' => $faker->name(),
            'phone_number' => $faker->phoneNumber(),
            'address_line' => $faker->streetAddress(),
            'city' => $faker->city(),
            'province' => $faker->state(),
            'postal_code' => $faker->postcode(),
            'is_primary' => false, // Kita atur 'is_primary' dari seeder
        ];
    }
}