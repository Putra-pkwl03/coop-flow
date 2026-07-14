<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fertilizer_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained('farmers')->onDelete('cascade');
            $table->foreignId('land_id')->constrained('lands')->onDelete('cascade');
            $table->foreignId('fertilizer_id')->constrained('fertilizers')->onDelete('cascade');
            $table->decimal('recommended_dosage_kg', 8, 2);
            $table->json('prediction_meta_input'); // Menyimpan input suhu, kelembapan, fase tanam, dll.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fertilizer_recommendations');
    }
};