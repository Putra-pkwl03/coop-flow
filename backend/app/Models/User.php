<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
    'name', 
    'email', 
    'password', 
    'phone', 
    'address',
    'cooperative_id',
    'status',    
    'rejection_reason'  
];
protected $guard_name = 'api';
    /**
     * Relasi: User (Admin Koperasi/Lapangan) bernaung di bawah satu Koperasi
     */
    public function cooperative(): BelongsTo
    {
        return $this->belongsTo(Cooperative::class);
    }

    /**
     * Hubungan lama Anda tetap dipertahankan jika diperlukan
     */
    public function parcels(): HasMany
    {
        return $this->hasMany(Parcel::class);
    }

    public function farmer(): HasOne
    {
        return $this->hasOne(Farmer::class);
    }
}