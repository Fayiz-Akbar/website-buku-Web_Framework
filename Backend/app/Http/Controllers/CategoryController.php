<?php

namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
      $cats = Category::query()
        ->orderBy('name')
        ->get(['id','name']); // tambah 'slug' jika ada kolomnya

      return response()->json(['data' => $cats]);
    }

    // GET /api/categories/{id}
    public function show($id)
    {
      $cat = Category::findOrFail($id);
      return response()->json(['data' => $cat]);
    }
}