<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FertilizerRecommendation extends Model
{
    protected $fillable = [
        'farmer_id', 'land_id', 'fertilizer_id', 
        'recommended_dosage_kg', 'prediction_meta_input'
    ];

    // Cast kolom JSON agar otomatis menjadi array di PHP
    protected $casts = [
        'prediction_meta_input' => 'array',
    ];

    public function fertilizer(): BelongsTo
    {
        return $this->belongsTo(Fertilizer::class);
    }
}