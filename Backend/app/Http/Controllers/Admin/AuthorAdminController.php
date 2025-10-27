<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorAdminController extends Controller
{
    public function index(Request $request)
    {
        if ($request->boolean('all')) {
            $items = Author::select('id','name')->orderBy('name')->get();
            return response()->json(['data' => $items]);
        }

        $perPage = (int)($request->integer('per_page') ?: 15);
        $items = Author::select('id','name')->orderBy('name')->paginate($perPage);
        return response()->json(['data' => $items]);
    }
}