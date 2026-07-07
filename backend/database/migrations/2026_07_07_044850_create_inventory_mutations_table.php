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
        Schema::create('inventory_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fertilizer_id')->constrained('fertilizers')->onDelete('cascade');
            
            // Hubungan opsional ke tabel farmers buatan temanmu jika tipenya "keluar" untuk tebus pupuk
            $table->foreignId('farmer_id')->nullable()->constrained('farmers')->onDelete('set null');
            
            $table->enum('type', ['masuk', 'keluar']);
            $table->integer('quantity_kg');
            $table->text('description'); // Nomor surat jalan atau keterangan tebusan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_mutations');
    }
};
