<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parcels', function (Blueprint $table) {
            $table->id();
            // Menghubungkan lahan ke user/petani tertentu
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            $table->string('name'); // Nama lahan, misal: "Sawah Blok A"
            $table->decimal('area_hectares', 8, 2); // Luas lahan dalam hektar
            $table->string('status')->default('active'); // active, inactive
            $table->timestamps();
        });

        // Menambahkan kolom Geometri (Polygon) PostGIS secara manual via DB RAW
        // 4326 adalah SRID standar untuk koordinat GPS (WGS 84)
        DB::statement('ALTER TABLE parcels ADD COLUMN geom geometry(Polygon, 4326)');
        
        // Membuat index spasial agar pencarian data GIS cepat
        DB::statement('CREATE INDEX parcels_geom_spatial_index ON parcels USING gist(geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('parcels');
    }
};