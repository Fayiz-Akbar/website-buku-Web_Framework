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
        Schema::table('order_items', function (Blueprint $table) {
            // Kolom 'price' (Total harga item: kuantitas * harga satuan)
            if (!Schema::hasColumn('order_items', 'price')) {
                 // Precision 10, scale 2: Total 10 digit, 2 di belakang koma
                 $table->decimal('price', 10, 2)->after('quantity'); 
            }
            
            // Kolom 'snapshot_price_per_item' (Harga satuan)
            if (!Schema::hasColumn('order_items', 'snapshot_price_per_item')) {
                 $table->decimal('snapshot_price_per_item', 10, 2)->after('snapshot_book_title'); 
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Hapus kolom saat rollback
            if (Schema::hasColumn('order_items', 'price')) {
                $table->dropColumn('price');
            }
            if (Schema::hasColumn('order_items', 'snapshot_price_per_item')) {
                $table->dropColumn('snapshot_price_per_item');
            }
        });
    }
};