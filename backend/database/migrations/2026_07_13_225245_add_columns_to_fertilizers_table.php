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
        Schema::table('fertilizers', function (Blueprint $table) {
            // Gabungkan menjadi satu blok up yang bersih dan aman
            $table->string('fertilizer_code')->nullable()->unique()->after('id');
            $table->unsignedInteger('packaging_size_kg')->default(50)->after('name'); 
            $table->enum('status', ['tersedia', 'menipis', 'habis'])->default('tersedia')->after('price_per_kg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fertilizers', function (Blueprint $table) {
            $table->dropColumn(['fertilizer_code', 'packaging_size_kg', 'status']);
        });
    }
};