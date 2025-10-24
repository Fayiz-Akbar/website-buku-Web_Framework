<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
class UserAddressFactory extends Factory {
    public function definition(): array {
        return [
            // user_id akan diisi di Seeder
            'label' => fake()->randomElement(['Rumah', 'Kantor', 'Apartemen']),
            'recipient_name' => fake()->name(),
            'recipient_phone' => fake()->phoneNumber(),
            'full_address' => fake()->address(),
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'is_primary' => false, // Default tidak primer
        ];
    }
}