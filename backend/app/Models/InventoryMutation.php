<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMutation extends Model
{
    protected $fillable = ['fertilizer_id', 'farmer_id', 'type', 'quantity_kg', 'description'];

    // Relasi ke data Pupuk terkait
    public function fertilizer(): BelongsTo
    {
        return $this->belongsTo(Fertilizer::class);
    }

    // Relasi opsional ke tabel Farmer buatan temanmu (jika pupuk ditebus petani)
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }
}