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
        Schema::create('cooperatives', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->string('cooperative_code')->unique();
            
            // ➕ Tambahkan field legalitas & kontak baru di sini
            $table->string('nik_cooperative', 50)->unique()->nullable();
            $table->string('legal_entity_type')->nullable();
            $table->string('legal_entity_number')->nullable();
            $table->date('established_date')->nullable();
            $table->string('npwp', 50)->nullable();
            
            $table->string('address')->nullable();
            $table->string('email_cooperative')->nullable();
            $table->string('phone_cooperative', 20)->nullable();
            $table->string('postal_code', 10)->nullable();
            
            // Field Alamat Wilayah Regional
            $table->string('province')->nullable();
            $table->string('city_koor')->nullable();
            $table->string('district')->nullable();
            $table->string('village')->nullable();

            $table->decimal('latitude', 10, 8)->nullable(); 
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('warehouse_capacity_ton')->nullable();

            $table->boolean('is_activated')->default(false);
            $table->boolean('is_profile_completed')->default(false); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cooperatives');
    }
};