<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'land_id',
        'plant_id',
        'fertilizer_name',
        'amount',
        'unit',
        'application_date',
        'phase',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'application_date' => 'date',
    ];

    /**
     * Relasi balik ke Petani
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Relasi balik ke Lahan
     */
    public function land(): BelongsTo
    {
        return $this->belongsTo(Land::class);
    }

    /**
     * Relasi balik ke Tanaman
     */
    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }
}