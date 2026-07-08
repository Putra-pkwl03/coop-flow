<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained('farmers')->onDelete('cascade');
            $table->string('land_name'); 
            
            $table->char('province_id', 2)->nullable();
            $table->char('city_id', 4)->nullable();
            $table->char('district_id', 7)->nullable();
            $table->char('village_id', 10)->nullable();

            $table->decimal('area', 8, 2); 
            $table->string('unit')->default('Ha'); 
            
            $table->enum('status', ['Milik Sendiri', 'Sewa', 'Bagi Hasil', 'Lainnya'])->default('Milik Sendiri');
            
            $table->string('current_use')->nullable(); 
            $table->string('soil_type')->nullable(); 
            $table->string('water_source')->nullable(); 
            $table->string('irrigation_type')->nullable(); 
            $table->string('ownership_document')->nullable(); 

            $table->text('location_address')->nullable(); 
            $table->json('polygon_coordinates')->nullable(); 

            $table->decimal('center_latitude', 10, 8)->nullable();
            $table->decimal('center_longitude', 11, 8)->nullable();
            
            $table->decimal('average_temperature', 4, 1)->nullable(); 
            $table->unsignedInteger('average_humidity')->nullable(); 
            $table->decimal('average_monthly_precipitation', 7, 2)->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lands');
    }
};