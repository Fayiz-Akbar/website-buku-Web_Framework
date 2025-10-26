<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required','string','max:255'],
        ]);

        $user = $request->user();
        $user->full_name = $data['full_name'];
        $user->save();

        return response()->json(['user' => $user]);
    }

    public function updatePhoto(Request $request)
    {
        try {
            // Validasi dasar
            $request->validate([
                'photo' => ['required','image','mimes:jpg,jpeg,png,webp,gif','max:2048'],
            ]);

            if (!$request->hasFile('photo') || !$request->file('photo')->isValid()) {
                return response()->json(['message' => 'File foto tidak valid'], 422);
            }

            $user = $request->user();

            // Hapus avatar lama hanya jika path lokal (bukan URL http)
            if ($user->avatar && !preg_match('/^https?:\/\//i', $user->avatar)) {
                try {
                    if (Storage::disk('public')->exists($user->avatar)) {
                        Storage::disk('public')->delete($user->avatar);
                    }
                } catch (\Throwable $e) {
                    Log::warning('Gagal hapus avatar lama', ['err' => $e->getMessage()]);
                }
            }

            // Simpan file ke storage/app/public/avatars
            $path = $request->file('photo')->store('avatars', 'public');

            $user->avatar = $path;
            $user->save();

            return response()->json(['user' => $user->fresh()], 200);
        } catch (\Throwable $e) {
            Log::error('Upload foto gagal', [
                'contentType' => $request->header('Content-Type'),
                'hasFile' => $request->hasFile('photo'),
                'err' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Upload gagal'], 500);
        }
    }
}