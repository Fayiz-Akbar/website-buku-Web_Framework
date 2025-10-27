<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publisher;
use Illuminate\Http\Request;

class PublisherAdminController extends Controller
{
    public function index(Request $request)
    {
        if ($request->boolean('all')) {
            $items = Publisher::select('id','name')->orderBy('name')->get();
            return response()->json(['data' => $items]);
        }

        $perPage = (int)($request->integer('per_page') ?: 15);
        $items = Publisher::select('id','name')->orderBy('name')->paginate($perPage);
        return response()->json(['data' => $items]);
    }
}