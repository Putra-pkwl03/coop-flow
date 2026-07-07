<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cooperative extends Model
{
    protected $fillable = ['name'];

    // Relasi: Satu Koperasi bisa punya banyak Gudang
    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }
}