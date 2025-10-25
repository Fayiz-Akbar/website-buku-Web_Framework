<?php

namespace App\Http\Controllers\Api; // <-- Namespace Anda

use App\Http\Controllers\Controller;
use App\Models\Publisher; // Model Publisher
use App\Http\Resources\PublisherResource; // Resource Anda
use Illuminate\Http\Request;
use Illuminate\Http\Response; // Untuk method destroy
use Illuminate\Http\Resources\Json\AnonymousResourceCollection; // Untuk method index

class PublisherController extends Controller
{
    /**
     * Menampilkan semua data publisher.
     */
    public function index(): AnonymousResourceCollection
    {
        // Ambil semua publisher, urutkan berdasarkan nama
        $publishers = Publisher::orderBy('name', 'asc')->get();
        
        // Kembalikan sebagai collection resource
        return PublisherResource::collection($publishers);
    }

    /**
     * Menyimpan publisher baru.
     */
    public function store(Request $request): PublisherResource
    {
        // Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:publishers',
        ]);

        $publisher = Publisher::create($validated);

        // Kembalikan data yang baru dibuat melalui resource
        return PublisherResource::make($publisher);
    }

    /**
     * Menampilkan satu data publisher.
     */
    public function show(Publisher $publisher): PublisherResource
    {
        // Laravel akan otomatis mencari Publisher berdasarkan ID (Route Model Binding)
        // dan kembalikan 404 jika tidak ketemu.
        
        return PublisherResource::make($publisher);
    }

    /**
     * Mengupdate data publisher.
     */
    public function update(Request $request, Publisher $publisher): PublisherResource
    {
        // Validasi input
        $validated = $request->validate([
            // Rule 'unique' harus mengabaikan ID publisher saat ini
            'name' => 'required|string|max:255|unique:publishers,name,' . $publisher->id,
        ]);

        $publisher->update($validated);

        // Kembalikan data yang sudah di-update
        return PublisherResource::make($publisher);
    }

    /**
     * Menghapus data publisher (Soft Delete).
     */
    public function destroy(Publisher $publisher): Response
    {
        // Asumsi Model Publisher Anda sudah menggunakan trait 'SoftDeletes'
        $publisher->delete();

        // Kembalikan response 204 (No Content)
        return response()->noContent();
    }
}