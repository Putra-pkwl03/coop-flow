<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Farmer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'farmer_group_id',
        'nik',
        'province_id', 
        'city_id',     
        'district_id', 
        'village_id',  
        'total_land_area',
        'notes',
    ];

    /**
     * Relasi ke model User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * RELASI: Petani termasuk ke dalam sebuah Kelompok Tani
     */
    public function farmer_group(): BelongsTo
    {
        return $this->belongsTo(FarmerGroup::class, 'farmer_group_id');
    }

    /**
     * Relasi ke model Land (Lahan)
     */
    public function lands(): HasMany
    {
        return $this->hasMany(Land::class);
    }

    public function village()
    {
        return $this->belongsTo(\Laravolt\Indonesia\Models\Village::class, 'village_id', 'code');
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
}
