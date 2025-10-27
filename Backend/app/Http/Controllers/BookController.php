<?php
// Path: Backend/app/Http/Controllers/BookController.php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookController extends Controller
{
    // GET /api/books
    public function index(Request $request)
    {
        $limit   = (int) ($request->integer('limit') ?: 0);
        $perPage = (int) ($request->integer('per_page') ?: 24);
        $sort    = $request->get('sort');

        $sortMap = [
            null         => ['created_at', 'desc'],
            'latest'     => ['created_at', 'desc'],
            'popular'    => [Schema::hasColumn('books', 'sold_count') ? 'sold_count' : 'created_at', 'desc'],
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'title_asc'  => ['title', 'asc'],
            'title_desc' => ['title', 'desc'],
        ];
        [$sortCol, $sortDir] = $sortMap[$sort] ?? $sortMap[null];

        $q = Book::with(['authors', 'publisher', 'categories'])
            ->orderBy($sortCol, $sortDir);

        // Filter kategori (many-to-many)
        if ($catId = $request->integer('category_id')) {
            $q->whereHas('categories', fn($qr) => $qr->where('categories.id', $catId));
        }

        // --- (1) PERBAIKAN PENCARIAN DI SINI ---
        // Fungsi ini sekarang mencari 'q' di title, description, dan nama author
        if ($search = trim((string) $request->query('q', ''))) {
            $driver = DB::getDriverName();
            $likeOp = $driver === 'pgsql' ? 'ilike' : 'like';
            
            $q->where(function ($w) use ($search, $likeOp) {
                // Cari di Judul Buku
                $w->where('title', $likeOp, "%{$search}%")
                  // Cari di Deskripsi Buku
                  ->orWhere('description', $likeOp, "%{$search}%")
                  // Cari di Nama Penulis (Relasi Many-to-Many)
                  ->orWhereHas('authors', function ($query) use ($search, $likeOp) {
                      $query->where('name', $likeOp, "%{$search}%");
                  });
            });
        }
        // --- BATAS PERBAIKAN ---

        // Non-paginated (untuk homepage)
        if ($limit > 0 && !$request->has('page')) {
            $list = $q->limit($limit)->get();
            return response()->json([
                'data' => $list->map(fn ($b) => $this->mapBook($b))->values(),
            ]);
        }

        // Paginated (untuk halaman katalog)
        $pag = $q->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => $pag->getCollection()->map(fn ($b) => $this->mapBook($b))->values(),
            'meta' => [
                'current_page' => $pag->currentPage(),
                'per_page'     => $pag->perPage(),
                'total'        => $pag->total(),
                'last_page'    => $pag->lastPage(),
            ],
        ]);
    }

    // GET /api/books/{book}
    public function show(Book $book)
    {
        $book->load(['authors', 'publisher', 'categories']);
        return response()->json(['data' => $this->mapBook($book)]);
    }

    // POST /api/books
    public function store(Request $request)
    {
        $request->validate([
            'title'        => ['required','string','max:255'],
            'price'        => ['required','numeric','min:0'],
            'stock'        => ['required','integer','min:0'],
            'description'  => ['nullable','string'],
            'publisher_id' => ['nullable','integer','exists:publishers,id'],
            'cover'        => ['nullable','image','mimes:jpg,jpeg,png,webp,gif','max:2048'],
            'cover_image'  => ['nullable','image','mimes:jpg,jpeg,png,webp,gif','max:2048'],
            'cover_image_url' => ['nullable', 'string', 'url'] // Tambahkan validasi untuk URL
        ]);

        $book = new Book($request->only([
            'title','price','stock','description','publisher_id', 'cover_image_url'
        ]));

        if ($request->hasFile('cover') || $request->hasFile('cover_image')) {
            $file = $request->file('cover') ?? $request->file('cover_image');
            $path = $file->store('covers', 'public');
            // Jika ada file upload, prioritaskan itu
            $book->cover_image_url = $path; // Simpan path file ke kolom URL
        }

        $book->save();

        if ($request->filled('authors'))    $book->authors()->sync((array) $request->input('authors'));
        if ($request->filled('categories')) $book->categories()->sync((array) $request->input('categories'));

        $book->load(['author:id,name', 'category:id,name']);
        return response()->json($book, 201);
    }

    // PUT /api/books/{book}
    public function update(Request $request, Book $book)
    {
        $request->validate([
            'title'        => ['sometimes','string','max:255'],
            'price'        => ['sometimes','numeric','min:0'],
            'stock'        => ['sometimes','integer','min:0'],
            'description'  => ['nullable','string'],
            'publisher_id' => ['sometimes','integer','exists:publishers,id'],
            'cover'        => ['nullable','image','mimes:jpg,jpeg,png,webp,gif','max:2048'],
            'cover_image'  => ['nullable','image','mimes:jpg,jpeg,png,webp,gif','max:2048'],
            'cover_image_url' => ['nullable', 'string', 'url']
        ]);

        $book->fill($request->only([
            'title','price','stock','description','publisher_id', 'cover_image_url'
        ]));

        if ($request->hasFile('cover') || $request->hasFile('cover_image')) {
            $file = $request->file('cover') ?? $request->file('cover_image');
            $path = $file->store('covers', 'public');

            $old = $book->cover_image_url ?? $book->cover_image ?? $book->cover ?? null;
            if ($old && !preg_match('/^https?:\/\//i', $old)) {
                try { Storage::disk('public')->delete($old); } catch (\Throwable $e) {}
            }
            
            $book->cover_image_url = $path; // Simpan path file ke kolom URL
        }

        $book->save();

        if ($request->filled('authors'))    $book->authors()->sync((array) $request->input('authors'));
        if ($request->filled('categories')) $book->categories()->sync((array) $request->input('categories'));

        $book->load(['author:id,name', 'category:id,name']);
        return response()->json($book);
    }

    // DELETE /api/books/{book}
    // Soft delete (TIDAK menghapus file cover)
    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Buku berhasil dihapus (soft delete)'], 200);
    }

    // Pulihkan buku terhapus
    public function restore($id)
    {
        $book = Book::withTrashed()->findOrFail($id);
        $book->restore();
        return response()->json(['message' => 'Buku dipulihkan'], 200);
    }

    // Hapus permanen + hapus file cover (opsional, untuk menu Trash)
    public function forceDestroy($id)
    {
        $book = Book::withTrashed()->findOrFail($id);

        // Hapus file cover hanya saat force delete
        $coverPath = $book->cover ?? $book->cover_path ?? $book->cover_image ?? null;
        if ($coverPath) {
            if (Str::startsWith($coverPath, ['http://', 'https://'])) {
                $parsed = parse_url($coverPath);
                $path = $parsed['path'] ?? '';
                $prefix = '/storage/';
                if ($path && str_contains($path, $prefix)) {
                    $relative = ltrim(substr($path, strpos($path, $prefix) + strlen($prefix)), '/');
                    Storage::disk('public')->delete($relative);
                }
            } else {
                $relative = ltrim(preg_replace('/^\/?storage\/?/i', '', $coverPath), '/');
                Storage::disk('public')->delete($relative);
            }
        }

        $book->forceDelete();
        return response()->json(['message' => 'Buku dihapus permanen'], 200);
    }

    // GET /api/categories/{id}/books
    public function byCategory($id, Request $request)
    {
        $perPage = (int) ($request->integer('per_page') ?: $request->integer('limit') ?: 24);

        $pag = Book::with(['authors','publisher','categories'])
            ->whereHas('categories', fn($q) => $q->where('categories.id', $id))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => $pag->getCollection()->map(fn ($b) => $this->mapBook($b))->values(),
            'meta' => [
                'current_page' => $pag->currentPage(),
                'per_page'     => $pag->perPage(),
                'total'        => $pag->total(),
                'last_page'    => $pag->lastPage(),
            ],
        ]);
    }

    // Fungsi helper untuk memetakan data Buku ke JSON
    private function mapBook(Book $b): array
    {
        $coverUrl = $this->buildCoverUrl($b);

        $authors = $b->relationLoaded('authors')
            ? $b->authors->map(fn($a) => ['id'=>$a->id,'name'=>$a->name])->values()
            : collect();

        $categories = $b->relationLoaded('categories')
            ? $b->categories->map(fn($c) => ['id'=>$c->id,'name'=>$c->name])->values()
            : collect();

        $publisher = $b->relationLoaded('publisher') && $b->publisher
            ? ['id'=>$b->publisher->id,'name'=>$b->publisher->name]
            : null;

        return [
            'id'         => $b->id,
            'title'      => $b->title,
            'price'      => $b->price,
            'stock'      => $b->stock,
            'description'=> $b->description,
            'cover_url'  => $coverUrl, // Ini yang dibaca frontend

            'publisher'  => $publisher,
            'authors'    => $authors,
            'categories' => $categories,

            // Fallback untuk JSON lama (jika ada)
            'author'     => $authors->first() ?: null,
            'category'   => $categories->first() ?: null,

            'created_at' => $b->created_at,
            'updated_at' => $b->updated_at,
        ];
    }

    // Fungsi helper untuk membangun URL gambar
    private function buildCoverUrl(Book $b): ?string
    {
        // (2) PERBAIKAN DARI MASALAH GAMBAR SEBELUMNYA
        // Prioritaskan 'cover_image_url' karena ini yang diisi oleh Seeder
        $raw = $b->cover_image_url 
            ?? $b->cover_image
            ?? $b->cover
            ?? ($b->image_url ?? null)
            ?? ($b->image ?? null)
            ?? ($b->thumbnail ?? null)
            ?? null;

        if (!$raw || trim($raw) === '') {
            // fallback ke gambar default jika semua kolom kosong
            return asset('images/default-book.jpg');
        }

        $raw = ltrim($raw);

        // Jika sudah URL absolut (dari Seeder)
        if (preg_match('~^https?://~i', $raw)) {
            return $raw;
        }

        // Jika path adalah file upload (storage)
        if (Str::startsWith($raw, ['storage/', '/storage/'])) {
            return asset(ltrim($raw, '/'));
        }
        
        // Cek apakah file ada di public disk
        if (Storage::disk('public')->exists($raw)) {
             return asset('storage/'.ltrim($raw, '/'));
        }

        // Fallback untuk path lain
        return asset(ltrim($raw, '/'));
    }
}