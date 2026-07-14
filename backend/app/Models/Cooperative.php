<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cooperative extends Model
{
    protected $fillable = [
    'name', 
    'cooperative_code', 
    'nik_cooperative', 
    'legal_entity_type',
    'legal_entity_number',   
    'established_date',   
    'npwp',   
    'address', 
    'email_cooperative',  
    'phone_cooperative',  
    'postal_code', 
    'province',    
    'city_koor',  
    'district',    
    'village',      
    'latitude', 
    'longitude', 
    'warehouse_capacity_ton',
    'is_activated', 
    'is_profile_completed'
];

    /**
     * Relasi: Satu Koperasi bisa memiliki banyak gudang cabang (jika ada model Warehouse terpisah)
     */
    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    /**
     * Relasi: Satu Koperasi menaungi banyak user (misal: Admin Koperasi & Admin Lapangan lokal)
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}