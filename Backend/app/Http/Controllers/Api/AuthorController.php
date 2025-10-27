<?php
// File: Backend/app/Http/Controllers/Api/AuthorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Http\Resources\AuthorResource; // FIX: Import Resource
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    // GET /api/admin/authors
    public function index()
    {
        // Menggunakan Resource untuk memastikan format data benar dan defensif
        $authors = Author::orderBy('name')->get(); 
        return AuthorResource::collection($authors);
    }
    
    // POST /api/admin/authors
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:authors,name',
            'bio' => 'nullable|string',
        ]);

        $author = Author::create($request->all());
        return AuthorResource::make($author);
    }
    
    // GET /api/admin/authors/{author}
    public function show(Author $author)
    {
        return AuthorResource::make($author);
    }

    // PUT/PATCH /api/admin/authors/{author}
    public function update(Request $request, Author $author)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:authors,name,' . $author->id,
            'bio' => 'nullable|string',
        ]);

        $author->update($request->all());
        return AuthorResource::make($author);
    }

    // DELETE /api/admin/authors/{author}
    public function destroy(Author $author)
    {
        // Catatan: Jika ada buku yang terhubung, ini akan gagal kecuali ada onDelete('cascade')
        $author->delete();
        return response()->json(['message' => 'Penulis berhasil dihapus.']);
    }
}