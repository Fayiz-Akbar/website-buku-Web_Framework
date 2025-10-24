<?php
// File: Backend/database/factories/UserFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Kata sandi saat ini yang digunakan oleh factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Gunakan 'full_name' sesuai migrasi kita
            'full_name' => fake()->name(), // <-- Ganti 'name' menjadi 'full_name'
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            // Gunakan Hash facade untuk password
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // Default role adalah 'user' (sesuai migrasi)
            'role' => 'user',
            // Tambahkan profile_image_url opsional
            'profile_image_url' => fake()->optional()->imageUrl(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}