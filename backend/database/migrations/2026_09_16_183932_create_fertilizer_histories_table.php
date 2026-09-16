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
        Schema::create('fertilizer_histories', function (Blueprint $table) {
            $table->id();
            
            // Foreign Keys
            $table->foreignId('farmer_id')->constrained('farmers')->onDelete('cascade');
            $table->foreignId('land_id')->constrained('lands')->onDelete('cascade');
            $table->foreignId('plant_id')->nullable()->constrained('plants')->onDelete('set null');

            // Detail Pemupukan
            $table->string('fertilizer_name'); // Contoh: Urea, NPK Phonska, Organik
            $table->decimal('amount', 8, 2);   // Jumlah pupuk (contoh: 50.50)
            $table->string('unit')->default('kg'); // Satuan: kg, gram, liter
            $table->date('application_date');  // Tanggal pemupukan / pengajuan
            
            // Metadata & Status
            $table->string('phase')->nullable(); // Fase tanaman saat dipupuk (Vegetatif, Generatif, dll)
            $table->string('status')->default('submitted'); // status: submitted, approved, applied, rejected
            $table->text('notes')->nullable(); // Catatan tambahan petani/admin
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fertilizer_histories');
    }
};