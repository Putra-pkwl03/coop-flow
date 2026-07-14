<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Land extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'land_name',
        'province_id', 
        'city_id',          
        'district_id',      
        'village_id',       
        'area',
        'unit',               
        'status',           
        'current_use',        
        'soil_type',          
        'water_source',     
        'irrigation_type',     
        'ownership_document', 
        'location_address',
        'polygon_coordinates', 

        'center_latitude',
        'center_longitude',
        'average_temperature',
        'average_humidity',
        'average_monthly_precipitation'
    ];

    protected $casts = [
        'polygon_coordinates' => 'array',
        'average_temperature' => 'float',
        'average_humidity' => 'integer',
        'average_monthly_precipitation' => 'float',
    ];

    /**
     * Relasi ke model Farmer
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Relasi ke model Plant (Tanaman)
     */
    public function plants(): HasMany
    {
        return $this->hasMany(Plant::class);
    }


    public function province()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Province::class, 'province_id', 'code');
    }

    public function city()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\City::class, 'city_id', 'code');
    }

    public function district()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\District::class, 'district_id', 'code');
    }

    public function village()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Village::class, 'village_id', 'code');
    }
}