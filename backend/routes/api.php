<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParcelController;
use App\Http\Controllers\FarmerController; 
use App\Http\Controllers\FarmerGroupController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\Api\CooperativeDashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\CooperativeController; 
use App\Http\Controllers\Api\CooperativeRegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);

Route::post('/cooperative/register', [CooperativeRegistrationController::class, 'register']);

Route::prefix('regional')->group(function () {
    Route::get('/provinces', [RegionalController::class, 'getProvinces']);
    Route::get('/provinces/{province_id}/cities', [RegionalController::class, 'getCities']);
    Route::get('/cities/{city_id}/districts', [RegionalController::class, 'getDistricts']);
    Route::get('/districts/{district_id}/villages', [RegionalController::class, 'getVillages']);
});


/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib login/terautentikasi Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Route bawaan Laravel untuk mengambil profil user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user()->load(['roles', 'cooperative']); 
    });

    // Route untuk Logout (Hapus Token)
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Ekosistem Koperasi & Logistik (COOP-FLOW Core)
    |--------------------------------------------------------------------------
    */
    // Endpoint khusus admin koperasi untuk melengkapi koordinat & profil logistik mandiri
    Route::put('/cooperative/profile/complete', [CooperativeController::class, 'updateProfile']);
    
    // Endpoint untuk tombol Aktivasi & Autogenerate Akun Koperasi di Dashboard Kemenko
    Route::post('/cooperatives/{id}/activate', [CooperativeController::class, 'activate']);
    
    // API Resource CRUD Koperasi untuk Kemenko Pangan (index, store, show, update, destroy)
    Route::apiResource('cooperatives', CooperativeController::class);

    // Endpoint untuk Kelompok Fitur Review Pengajuan Koperasi Baru oleh Kemenko Pangan
    Route::prefix('kemenko/registrations')->group(function () {
        Route::get('/pending', [CooperativeRegistrationController::class, 'getPendingRegistrations']);
        Route::post('/{id}/approve', [CooperativeRegistrationController::class, 'approve']);
        Route::post('/{id}/reject', [CooperativeRegistrationController::class, 'reject']);
    });

    // Dashboard data ringkas admin koperasi
    Route::get('/cooperative/dashboard', [CooperativeDashboardController::class, 'getKoperasiData']);

    // Fitur manajemen stok-inventaris pupuk di gudang koperasi
    Route::prefix('cooperative/inventory')->group(function () {
        Route::get('/overview', [InventoryController::class, 'getOverview']);
        Route::get('/history', [InventoryController::class, 'getMutationHistory']);
        Route::post('/mutation', [InventoryController::class, 'storeMutation']);
    });

    /*
    |--------------------------------------------------------------------------
    | Manajemen Lahan, Petani & Wilayah
    |--------------------------------------------------------------------------
    */
    // Endpoint CRUD Kelompok Tani
    Route::apiResource('farmer-groups', FarmerGroupController::class);

    Route::post('farmers/{id}', [FarmerController::class, 'update']);

    // Route API CRUD Master Petani
    Route::apiResource('farmers', FarmerController::class);

    // Route untuk menyimpan Lahan Spasial Baru oleh Admin Lapangan
    Route::post('/parcels', [ParcelController::class, 'store']);

    // Route untuk kelola komoditas tanaman
    Route::apiResource('plants', PlantController::class);

    // Endpoint hapus lahan tunggal milik petani
    Route::delete('/farmers/lands/{landId}', [FarmerController::class, 'destroyLand']);

});