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
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel koperasi
            $table->foreignId('cooperative_id')->constrained('cooperatives')->onDelete('cascade');
            $table->string('name'); 
            $table->text('address'); 
            $table->double('surface_area'); 
            $table->integer('capacity_ton'); 
            $table->string('warehouse_type'); 
            $table->json('facilities')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouses');
    }
};
