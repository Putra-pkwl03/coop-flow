<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    protected $fillable = [
    'cooperative_id',
    'name',
    'address',
    'surface_area',
    'capacity_ton',
    'warehouse_type',
    'facilities'  
];

protected $casts = [
    'facilities' => 'array',
];

    // Relasi ke Koperasi Induk
    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(Cooperative::class);
    }

    // Relasi: Satu Gudang menyimpan banyak jenis Stok Pupuk
    public function fertilizers(): HasMany
    {
        return $this->hasMany(Fertilizer::class);
    }
}