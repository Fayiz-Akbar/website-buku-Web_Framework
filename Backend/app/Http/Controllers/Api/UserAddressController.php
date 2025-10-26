<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    /**
     * List addresses for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $addresses = UserAddress::where('user_id', $user->id)
            ->orderByDesc('is_primary')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $addresses,
        ]);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'address_label' => ['required', 'string', 'max:100'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'phone_number' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'province' => ['required', 'string', 'max:120'],
            'postal_code' => ['required', 'string', 'max:10'],
            'is_primary' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['user_id'] = $user->id;

        return DB::transaction(function () use ($data, $user) {
            // If this is set as primary, unset others
            if (!empty($data['is_primary']) && $data['is_primary']) {
                UserAddress::where('user_id', $user->id)->update(['is_primary' => false]);
            }

            $address = UserAddress::create($data);

            return response()->json([
                'message' => 'Alamat berhasil ditambahkan.',
                'data' => $address,
            ], 201);
        });
    }

    /**
     * Update an address
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $address = UserAddress::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'address_label' => ['sometimes', 'string', 'max:100'],
            'recipient_name' => ['sometimes', 'string', 'max:150'],
            'phone_number' => ['sometimes', 'string', 'max:30'],
            'address_line' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:120'],
            'province' => ['sometimes', 'string', 'max:120'],
            'postal_code' => ['sometimes', 'string', 'max:10'],
            'is_primary' => ['sometimes', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        return DB::transaction(function () use ($data, $address, $user) {
            if (array_key_exists('is_primary', $data) && $data['is_primary']) {
                UserAddress::where('user_id', $user->id)->update(['is_primary' => false]);
            }

            $address->fill($data);
            $address->save();

            return response()->json([
                'message' => 'Alamat berhasil diperbarui.',
                'data' => $address,
            ]);
        });
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $address = UserAddress::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        return DB::transaction(function () use ($address, $user) {
            $wasPrimary = $address->is_primary;
            $address->delete();

            if ($wasPrimary) {
                // Set another address as primary if exists
                $next = UserAddress::where('user_id', $user->id)->orderByDesc('id')->first();
                if ($next) {
                    $next->is_primary = true;
                    $next->save();
                }
            }

            return response()->json(['message' => 'Alamat berhasil dihapus.']);
        });
    }

    /**
     * Set an address as primary
     */
    public function setPrimary(Request $request, $id)
    {
        $user = $request->user();
        $address = UserAddress::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        return DB::transaction(function () use ($user, $address) {
            UserAddress::where('user_id', $user->id)->update(['is_primary' => false]);
            $address->is_primary = true;
            $address->save();

            return response()->json(['message' => 'Alamat utama diperbarui.']);
        });
    }
}
