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
        Schema::create('fertilizers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->string('name'); // Contoh: Urea, NPK, ZA
            $table->integer('current_stock_kg')->default(0);
            $table->integer('minimum_stock_kg')->default(1000);
            $table->integer('price_per_kg')->default(0); // Untuk memicu total nilai rupiah di frontend
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fertilizers');
    }
};
