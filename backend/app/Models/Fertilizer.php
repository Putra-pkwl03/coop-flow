<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fertilizer extends Model
{
    protected $fillable = ['warehouse_id', 'name', 'current_stock_kg', 'minimum_stock_kg', 'price_per_kg'];

    // Relasi: Pupuk ini disimpan di Gudang mana
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
    // Relasi: Pupuk ini punya banyak rekam jejak keluar masuk
    public function mutations(): HasMany
    {
        return $this->hasMany(InventoryMutation::class);
    }
}