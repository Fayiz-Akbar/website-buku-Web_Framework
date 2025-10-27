<?php
// File: Backend/app/Http/Controllers/Api/PublisherController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use App\Http\Resources\PublisherResource; // FIX: Import Resource
use Illuminate\Http\Request;

class PublisherController extends Controller
{
    // GET /api/admin/publishers
    public function index()
    {
        // Menggunakan Resource untuk memastikan format data benar
        $publishers = Publisher::orderBy('name')->get();
        return PublisherResource::collection($publishers);
    }
    
    // POST /api/admin/publishers
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:publishers,name',
            'description' => 'nullable|string',
        ]);

        $publisher = Publisher::create($request->all());
        return PublisherResource::make($publisher);
    }
    
    // GET /api/admin/publishers/{publisher}
    public function show(Publisher $publisher)
    {
        return PublisherResource::make($publisher);
    }

    // PUT/PATCH /api/admin/publishers/{publisher}
    public function update(Request $request, Publisher $publisher)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:publishers,name,' . $publisher->id,
            'description' => 'nullable|string',
        ]);

        $publisher->update($request->all());
        return PublisherResource::make($publisher);
    }

    // DELETE /api/admin/publishers/{publisher}
    public function destroy(Publisher $publisher)
    {
        $publisher->delete();
        return response()->json(['message' => 'Penerbit berhasil dihapus.']);
    }
}