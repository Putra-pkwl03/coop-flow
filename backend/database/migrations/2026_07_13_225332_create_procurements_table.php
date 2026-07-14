<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurements', function (Blueprint $table) {
            $table->id();
            $table->string('procurement_no')->unique();
            $table->foreignId('cooperative_id')->constrained('cooperatives')->onDelete('cascade');
            $table->foreignId('fertilizer_id')->constrained('fertilizers')->onDelete('cascade');
            $table->integer('quantity_bags');
            $table->integer('quantity_kg');
            $table->enum('status', ['menunggu_validasi', 'disetujui', 'ditolak'])->default('menunggu_validasi');
            $table->foreignId('validated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('sent_at')->nullable();
            $table->date('estimated_arrival')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurements');
    }
};