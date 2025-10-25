<?php
// File: Backend/app/Http/Controllers/Api/BookController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// ===== PERBAIKI IMPOR RESOURCE DI SINI =====
use App\Http\Resources\BookResource;
use App\Http\Resources\AuthorResource; // Jika diperlukan nanti
use App\Http\Resources\CategoryResource; // Jika diperlukan nanti
use App\Http\Resources\PublisherResource; // Jika diperlukan nanti
// ===========================================
use App\Models\Book;
use Illuminate\Http\Request;

use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB; // <-- Tambahkan ini untuk transaksi di store/update
use Symfony\Component\HttpFoundation\Response; // <-- Tambahkan ini untuk destroy

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/books
     *
     * Mengembalikan daftar semua buku (dengan paginasi).
     */
    public function index(): AnonymousResourceCollection // <-- 2. Tipe return adalah Resource Collection
    {
        // 3. Eager Loading Relasi (PENTING untuk performa N+1)
        // Kita beritahu Eloquent untuk mengambil relasi ini sekaligus
        $books = Book::with(['publisher', 'authors', 'categories'])
                    ->paginate(15); // Misalnya, 15 buku per halaman

        // 4. Gunakan Resource Collection untuk membungkus data
        // Ini akan otomatis memanggil BookResource::toArray()
        // untuk setiap buku dalam koleksi.
        return BookResource::collection($books);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/admin/books (Contoh untuk Admin)
     */
    public function store(Request $request): BookResource // <-- 5. Return Resource tunggal
    {
        // (Pastikan rute ini dilindungi oleh middleware 'admin')
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'publisher_id' => 'nullable|exists:publishers,id',
            'isbn' => 'nullable|string|unique:books,isbn',
            'description' => 'nullable|string',
            'page_count' => 'nullable|integer|min:0',
            'published_year' => 'nullable|integer',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_image_url' => 'nullable|url',
            // Validasi untuk relasi Many-to-Many (authors, categories)
            'author_ids' => 'nullable|array',
            'author_ids.*' => 'integer|exists:authors,id', // Pastikan setiap ID ada
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        // Gunakan transaksi jika membuat buku dan relasinya
        $book = DB::transaction(function () use ($validated) {
            $newBook = Book::create($validated);

            // Lampirkan relasi N-N (jika ada)
            if (!empty($validated['author_ids'])) {
                $newBook->authors()->sync($validated['author_ids']);
            }
            if (!empty($validated['category_ids'])) {
                $newBook->categories()->sync($validated['category_ids']);
            }
            return $newBook;
        });


        // 6. Kembalikan buku yang baru dibuat melalui Resource
        // Kita perlu load relasi lagi agar ditampilkan di response
        $book->load(['publisher', 'authors', 'categories']);
        return BookResource::make($book);
    }

    /**
     * Display the specified resource.
     * GET /api/books/{id}
     */
    public function show(string $id): BookResource // <-- 7. Tipe return adalah Resource tunggal
    {
        // 8. Eager load relasi
        $book = Book::with(['publisher', 'authors', 'categories'])
                    ->findOrFail($id); // findOrFail akan otomatis 404 jika tidak ketemu

        // 9. Kembalikan data melalui Resource
        return BookResource::make($book);
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/admin/books/{id} (Contoh untuk Admin)
     */
    public function update(Request $request, string $id): BookResource
    {
        // (Pastikan rute ini dilindungi oleh middleware 'admin')
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'publisher_id' => 'sometimes|nullable|exists:publishers,id',
            // Unique rule harus mengabaikan ID buku saat ini
            'isbn' => 'sometimes|nullable|string|unique:books,isbn,' . $book->id,
            'description' => 'sometimes|nullable|string',
            'page_count' => 'sometimes|nullable|integer|min:0',
            'published_year' => 'sometimes|nullable|integer',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'cover_image_url' => 'sometimes|nullable|url',
            'author_ids' => 'sometimes|nullable|array',
            'author_ids.*' => 'integer|exists:authors,id',
            'category_ids' => 'sometimes|nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);

        DB::transaction(function () use ($book, $validated, $request) { // <-- TAMBAHKAN $request DI SINI
        $book->update($validated);

        // Update relasi N-N (gunakan sync agar relasi lama terhapus)
        if ($request->has('author_ids')) { // Cek apakah array dikirim
            $book->authors()->sync($validated['author_ids'] ?? []); // Sync dengan array kosong jika null
        }
        if ($request->has('category_ids')) {
            $book->categories()->sync($validated['category_ids'] ?? []);
        }
    });


        // Kembalikan data buku yang sudah diupdate
        $book->load(['publisher', 'authors', 'categories']);
        return BookResource::make($book);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/admin/books/{id} (Contoh untuk Admin)
     */
    public function destroy(string $id): Response // <-- 10. Tipe return Response (biasanya 204 No Content)
    {
        // (Pastikan rute ini dilindungi oleh middleware 'admin')
        $book = Book::findOrFail($id);
        
        // Soft delete akan otomatis digunakan karena model Book
        // menggunakan trait SoftDeletes
        $book->delete();

        // 11. Kembalikan response 204 (No Content)
        return response()->noContent();
    }
}