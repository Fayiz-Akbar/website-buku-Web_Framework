<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Auth;

class UserAddressController extends Controller
{
    // ✅ Ambil semua alamat milik user login
    public function index()
    {
        $user = Auth::user();
        $addresses = UserAddress::where('user_id', $user->id)->orderByDesc('is_primary')->get();

        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    // ✅ Simpan alamat baru
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'address_label' => 'required|string|max:100',
            'recipient_name' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'address_line' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
        ]);

        // Jika user belum punya alamat, otomatis jadikan utama
        $validated['is_primary'] = UserAddress::where('user_id', $user->id)->count() === 0;
        $validated['user_id'] = $user->id;

        $address = UserAddress::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil ditambahkan',
            'data' => $address
        ]);
    }

    // ✅ Update alamat
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $address = UserAddress::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'address_label' => 'required|string|max:100',
            'recipient_name' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'address_line' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'required|string|max:10',
        ]);

        $address->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil diperbarui',
            'data' => $address
        ]);
    }

    // ✅ Hapus alamat
    public function destroy($id)
    {
        $user = Auth::user();
        $address = UserAddress::where('user_id', $user->id)->findOrFail($id);

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus'
        ]);
    }

    // ✅ Set alamat utama
    public function setPrimary($id)
    {
        $user = Auth::user();

        // Reset semua alamat ke non-primary
        UserAddress::where('user_id', $user->id)->update(['is_primary' => false]);

        // Set alamat yang dipilih jadi primary
        $address = UserAddress::where('user_id', $user->id)->findOrFail($id);
        $address->is_primary = true;
        $address->save();

        return response()->json([
            'success' => true,
            'message' => 'Alamat utama berhasil diperbarui',
            'data' => $address
        ]);
    }
}
