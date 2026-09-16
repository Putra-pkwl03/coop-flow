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
        Schema::table('lands', function (Blueprint $table) {
            // ID Poligon yang didapat dari registrasi Agro API
            $table->string('agro_polygon_id')->nullable()->after('polygon_coordinates');
            
            // Nilai NDVI rata-rata terbaru (rentang -1.0000 sampai 1.0000)
            $table->decimal('current_ndvi', 5, 4)->nullable()->after('agro_polygon_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lands', function (Blueprint $table) {
            $table->dropColumn(['agro_polygon_id', 'current_ndvi']);
        });
    }
};