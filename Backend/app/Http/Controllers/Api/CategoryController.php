<?php
// File: Backend/app/Http/Controllers/Api/CategoryController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource; // FIX: Import Resource
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/admin/categories
    public function index()
    {
        // Menggunakan Resource untuk memastikan format data benar
        $categories = Category::orderBy('name')->get();
        return CategoryResource::collection($categories);
    }
    
    // POST /api/admin/categories
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($request->all());
        return CategoryResource::make($category);
    }
    
    // GET /api/admin/categories/{category}
    public function show(Category $category)
    {
        return CategoryResource::make($category);
    }

    // PUT/PATCH /api/admin/categories/{category}
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($request->all());
        return CategoryResource::make($category);
    }

    // DELETE /api/admin/categories/{category}
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}