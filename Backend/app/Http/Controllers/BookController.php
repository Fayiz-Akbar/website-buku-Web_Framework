<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookController extends Controller
{
    // GET /api/books?limit=&per_page=&sort=&category_id=
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

        // Pencarian judul/deskripsi
        if ($search = trim((string) $request->query('q', ''))) {
            $driver = DB::getDriverName();
            $likeOp = $driver === 'pgsql' ? 'ilike' : 'like';
            $q->where(function ($w) use ($search, $likeOp) {
                $w->where('title', $likeOp, "%{$search}%")
                  ->orWhere('description', $likeOp, "%{$search}%");
            });
        }

        // Non-paginated (untuk homepage)
        if ($limit > 0 && !$request->has('page')) {
            $list = $q->limit($limit)->get();
            return response()->json([
                'data' => $list->map(fn ($b) => $this->mapBook($b))->values(),
            ]);
        }

        // Paginated
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

    public function show(Book $book)
    {
        $book->load(['authors', 'publisher', 'categories']);
        return response()->json(['data' => $this->mapBook($book)]);
    }

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
        ]);

        $book = new Book($request->only([
            'title','price','stock','description','publisher_id',
        ]));

        if ($request->hasFile('cover') || $request->hasFile('cover_image')) {
            $file = $request->file('cover') ?? $request->file('cover_image');
            $path = $file->store('covers', 'public');
            if (Schema::hasColumn('books','cover_image')) $book->cover_image = $path;
            elseif (Schema::hasColumn('books','cover'))   $book->cover = $path;
        }

        $book->save();

        // Jika ada authors[]/categories[] dalam request, sinkronkan pivot
        if ($request->filled('authors'))    $book->authors()->sync((array) $request->input('authors'));
        if ($request->filled('categories')) $book->categories()->sync((array) $request->input('categories'));

        $book->load(['authors','publisher','categories']);
        return response()->json(['data' => $this->mapBook($book)], 201);
    }

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
        ]);

        $book->fill($request->only([
            'title','price','stock','description','publisher_id',
        ]));

        if ($request->hasFile('cover') || $request->hasFile('cover_image')) {
            $file = $request->file('cover') ?? $request->file('cover_image');
            $path = $file->store('covers', 'public');

            $old = $book->cover_image ?? $book->cover ?? null;
            if ($old && !preg_match('/^https?:\/\//i', $old)) {
                try { Storage::disk('public')->delete($old); } catch (\Throwable $e) {}
            }

            if (Schema::hasColumn('books','cover_image')) $book->cover_image = $path;
            elseif (Schema::hasColumn('books','cover'))   $book->cover = $path;
        }

        $book->save();

        if ($request->filled('authors'))    $book->authors()->sync((array) $request->input('authors'));
        if ($request->filled('categories')) $book->categories()->sync((array) $request->input('categories'));

        $book->load(['authors','publisher','categories']);
        return response()->json(['data' => $this->mapBook($book)]);
    }

    public function destroy(Book $book)
    {
        $old = $book->cover_image ?? $book->cover ?? null;
        if ($old && !preg_match('/^https?:\/\//i', $old)) {
            try { Storage::disk('public')->delete($old); } catch (\Throwable $e) {}
        }
        $book->delete();
        return response()->json(['message' => 'Deleted']);
    }

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
            'cover_url'  => $coverUrl,

            'publisher'  => $publisher,
            'authors'    => $authors,
            'categories' => $categories,

            'author'     => $authors->first() ?: null,
            'category'   => $categories->first() ?: null,

            'created_at' => $b->created_at,
            'updated_at' => $b->updated_at,
        ];
    }

    private function buildCoverUrl(Book $b): ?string
    {
        // urutan kandidat kolom dari DB/seed JSON
        $raw = $b->cover_image
            ?? $b->cover
            ?? ($b->image_url ?? null)
            ?? ($b->cover_url ?? null)
            ?? ($b->image ?? null)
            ?? ($b->thumbnail ?? null) // tambahan fallback baru
            ?? null;

        if (!$raw || trim($raw) === '') {
            // fallback ke gambar default
            return asset('images/default-book.jpg');
        }

        $raw = ltrim($raw);

        // absolute URL
        if (preg_match('~^https?://~i', $raw)) {
            return $raw;
        }

        // path yang sudah mengarah ke public/
        $publicPrefixes = ['images/', 'img/', 'uploads/', 'covers/'];
        foreach (array_merge($publicPrefixes, array_map(fn($p)=>'/'.$p, $publicPrefixes)) as $prefix) {
            if (Str::startsWith($raw, $prefix)) {
                return asset(ltrim($raw, '/'));
            }
        }

        // path storage (public disk)
        if (Str::startsWith($raw, ['storage/', '/storage/'])) {
            return asset(ltrim($raw, '/'));
        }

        if (Storage::disk('public')->exists($raw)) {
            return asset('storage/'.ltrim($raw, '/'));
        }

        // fallback terakhir
        return asset(ltrim($raw, '/'));
    }
}
