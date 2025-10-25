<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth; // <-- 1. TAMBAHKAN BARIS INI

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 2. HAPUS TANDA KOMENTAR (//) DARI BLOK IF
        if (Auth::check() && Auth::user()->role == 'admin') {
            // Jika ya, lanjutkan request
            return $next($request);
        }

        // Jika tidak, tolak akses
        return response()->json(['message' => 'Akses ditolak. Hanya untuk Admin.'], 403);
    }
}