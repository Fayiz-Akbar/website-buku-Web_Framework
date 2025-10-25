<?php
// File: Backend/database/migrations/...._create_ecommerce_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Alamat User
        Schema::create('user_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // [PERBAIKAN] Tambahkan semua kolom ini
            $table->string('address_label')->default('Rumah'); // Label (Rumah, Kantor)
            $table->string('recipient_name'); // Nama penerima
            $table->string('phone_number'); // Nomor HP
            $table->string('address_line'); // Baris alamat (Jalan, No)
            $table->string('city'); // Kota
            $table->string('province'); // Provinsi
            $table->string('postal_code', 10); // Kode Pos
            $table->boolean('is_primary')->default(false); // Alamat utama?

            $table->timestamps();
            $table->softDeletes();
        });

        // Keranjang (Carts)
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->onDelete('cascade');
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->integer('quantity')->unsigned()->default(1);
            $table->timestamps();
            $table->unique(['cart_id', 'book_id']);
        });

        // Pesanan (Orders)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('user_address_id')->constrained('user_addresses')->onDelete('restrict');
            $table->string('order_code')->unique();
            $table->string('status')->default('menunggu_pembayaran'); // Kita 'hardcode' status di Laravel
            $table->decimal('total_items_price', 12, 2);
            $table->decimal('shipping_cost', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();
            $table->softDeletes();
        });

        // Order Items (dengan Data Snapshotting)
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('book_id')->nullable()->constrained('books')->onDelete('set null');
            $table->integer('quantity')->unsigned();
            // Data Snapshot (dicopy oleh Laravel saat checkout)
            $table->string('snapshot_book_title');
            $table->decimal('snapshot_price_per_item', 12, 2);
            $table->timestamps();
        });

        // Pembayaran (Payments)
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('restrict');
            $table->string('status')->default('pending');
            $table->string('payment_method')->default('qris_manual');
            $table->decimal('amount_due', 12, 2);
            $table->decimal('amount_paid', 12, 2)->nullable();
            $table->string('proof_image_url')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('user_addresses');
    }
};