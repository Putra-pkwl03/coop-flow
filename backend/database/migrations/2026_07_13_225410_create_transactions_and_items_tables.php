<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Utama Transaksi
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->foreignId('farmer_id')->constrained('farmers')->onDelete('cascade');
            $table->integer('total_items');
            $table->integer('total_weight_kg');
            $table->integer('total_price');
            $table->enum('payment_method', ['cash', 'transfer', 'subsidi']);
            $table->integer('amount_paid');
            $table->timestamps();
        });

        // 2. Tabel Item Detail Transaksi (Krititis: Foreign Key ke Transactions)
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->onDelete('cascade');
            $table->foreignId('fertilizer_id')->constrained('fertilizers')->onDelete('cascade');
            $table->integer('quantity_bags');
            $table->integer('quantity_kg');
            $table->integer('price_per_kg');
            $table->integer('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
    }
};