<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cooperative extends Model
{
    protected $fillable = [
        'name', 
        'cooperative_code', 
        'nib_cooperative',
        'legal_approval_document', 
        'legal_approval_number',   
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
        'warehouse_surface_area',
        'warehouse_capacity_ton',
        'warehouse_facilities',

        'is_activated', 
        'is_profile_completed'
    ];

    /**
     * Cast properti agar format JSON otomatis dikonversi menjadi array PHP
     */
    protected $casts = [
        'warehouse_facilities' => 'array',
        'established_date' => 'date',
        'is_activated' => 'boolean',
        'is_profile_completed' => 'boolean',
    ];

    /**
     * Relasi: Satu Koperasi memiliki banyak stok data pupuk langsung
     */
    public function fertilizers(): HasMany
    {
        return $this->hasMany(Fertilizer::class);
    }

    /**
     * Relasi: Satu Koperasi menaungi banyak user
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}