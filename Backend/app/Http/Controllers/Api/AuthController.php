<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth; // <-- Tambahkan ini untuk logout

class AuthController extends Controller
{
    /**
     * Handle user registration.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // Pastikan ada field 'password_confirmation'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Password di-hash
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // Cek user ada dan password cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Jika gagal, lempar exception
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Jika berhasil, buat token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // --- PERUBAHAN DIMULAI DI SINI ---

        return response()->json([
            // 'message' => 'Login successful', // Opsional, frontend tidak memerlukannya
            
            // 1. Ganti 'access_token' menjadi 'token'
            'token' => $token, 
            
            // 'token_type' => 'Bearer', // Opsional, frontend tidak memerlukannya
            
            // 2. Filter data user
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Pastikan kolom 'role' ada di tabel users
            ]
        ]);
        
        // --- PERUBAHAN SELESAI ---
    }

    /**
     * Logout pengguna (menghapus token saat ini).
     */
    public function logout(Request $request)
    {
        // Dapatkan user yang sedang login via token
        // Perlu middleware auth:sanctum di route agar $request->user() bekerja
        $user = $request->user();

        // Hapus token yang sedang digunakan untuk request ini
        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}

