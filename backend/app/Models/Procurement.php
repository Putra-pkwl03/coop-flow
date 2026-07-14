<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Procurement extends Model
{
    protected $fillable = [
        'procurement_no', 'cooperative_id', 'fertilizer_id', 
        'quantity_bags', 'quantity_kg', 'status', 
        'validated_by', 'sent_at', 'estimated_arrival'
    ];

    public function fertilizer(): BelongsTo
    {
        return $this->belongsTo(Fertilizer::class);
    }
}