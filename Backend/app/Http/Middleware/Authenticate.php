<?php
// File: Backend/app/Http/Middleware/Authenticate.php

namespace App\Http\Middleware; // <-- Pastikan namespace benar

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request; // <-- Pastikan di-import

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string // <-- Pastikan ada type hint Request
    {
        // Jika request TIDAK mengharapkan JSON, coba redirect (atau null)
        if (! $request->expectsJson()) {
            // Jika kamu PUNYA route web bernama 'login', gunakan ini:
            // return route('login'); 
            // Jika TIDAK punya route web 'login', kembalikan null:
             return null; 
        }

        // Jika request MENGHARAPKAN JSON, kembalikan null untuk memicu exception
        return null;
    }
}