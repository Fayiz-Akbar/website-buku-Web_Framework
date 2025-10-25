<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator; // Import Validator

class CategoryController extends Controller
{
    /**
     * Menampilkan semua data kategori.
     */
    public function index()
    {
        $categories = Category::orderBy('name', 'asc')->get();
        return response()->json($categories);
    }

    /**
     * Menyimpan kategori baru.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:categories',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category = Category::create($request->all());
        return response()->json($category, 201); // 201 Created
    }

    /**
     * Menampilkan satu data kategori.
     */
    public function show(Category $category)
    {
        // 'Category $category' adalah Route Model Binding
        // Laravel otomatis mencari Kategori berdasarkan ID di URL
        return response()->json($category);
    }

    /**
     * Mengupdate data kategori.
     */
    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            // 'unique' di-ignore untuk ID saat ini
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $category->update($request->all());
        return response()->json($category);
    }

    /**
     * Menghapus data kategori.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(null, 204); // 204 No Content
    }
}