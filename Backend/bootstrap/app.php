<?php
// File: Backend/bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException; // <-- 1. Import AuthenticationException
use Illuminate\Http\Request; // <-- 2. Import Request

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // ========================================================
        // TAMBAHKAN BLOK INI:
        // Menangani Unauthenticated untuk API
        // ========================================================
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            // Periksa apakah request adalah untuk API
            // (biasanya route dimulai 'api/' atau request mengharapkan JSON)
            if ($request->expectsJson() || $request->is('api/*')) {
                // Kembalikan response JSON 401
                return response()->json(
                    ['message' => 'Unauthenticated.'], // Pesan standar Laravel
                    401
                );
            }
            // Jika bukan request API, biarkan handler default (redirect ke login web)
            // return redirect()->guest($e->redirectTo() ?? route('login')); // Baris ini mungkin ada secara default
        });
        // ========================================================

        // Handler exception lain bisa ditambahkan di sini
        // ...

    })->create();