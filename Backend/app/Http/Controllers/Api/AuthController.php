<?php
// File: Backend/app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User; // Pastikan namespace model User benar
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // Import Validator
use Illuminate\Validation\Rules\Password; // Import Password rule

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request)
    {
        // 1. Validasi Input (Gunakan 'full_name')
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'], // <-- Ubah 'name' menjadi 'full_name'
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()], // Gunakan aturan password default Laravel
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422); // Error validasi
        }

        // 2. Buat User Baru (Gunakan 'full_name')
        $user = User::create([
            'full_name' => $request->full_name, // <-- Ubah 'name' menjadi 'full_name'
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // Role default 'user' sudah diatur di migrasi/model
        ]);

        // 3. Buat Token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // 4. Kembalikan Response
        return response()->json([
            'message' => 'Registrasi berhasil.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user // Kirim data user juga (tanpa password)
        ], 201); // 201 Created
    }

    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Coba Autentikasi
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Email atau password salah.'], 401); // 401 Unauthorized
        }

        // 3. Dapatkan User yang Terautentikasi
        $user = User::where('email', $request['email'])->firstOrFail();

        // 4. Buat Token Sanctum Baru
        // Sebaiknya hapus token lama jika ada untuk keamanan
        $user->tokens()->delete(); // Hapus token lama
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kembalikan Response
        return response()->json([
            'message' => 'Login berhasil.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user // Kirim data user juga
        ]);
        
        // --- PERUBAHAN SELESAI ---
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        // Hapus token saat ini yang digunakan untuk request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil.']);
    }
}