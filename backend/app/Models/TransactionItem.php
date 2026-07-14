<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = [
        'transaction_id', 'fertilizer_id', 'quantity_bags', 
        'quantity_kg', 'price_per_kg', 'subtotal'
    ];

    public function fertilizer(): BelongsTo
    {
        return $this->belongsTo(Fertilizer::class);
    }
}