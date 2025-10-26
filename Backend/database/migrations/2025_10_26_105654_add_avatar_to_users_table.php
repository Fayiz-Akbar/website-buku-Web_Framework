<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                // Tambahkan kolom avatar setelah kolom email
                $table->string('avatar')->nullable()->after('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                // Hapus kolom avatar jika di-rollback
                $table->dropColumn('avatar');
            });
        }
    }
};
