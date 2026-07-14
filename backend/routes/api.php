<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ParcelController;
use App\Http\Controllers\FarmerController; 
use App\Http\Controllers\FarmerGroupController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\CooperativeDashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CooperativeController; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);


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

    // Endpoint data regional/wilayah administrasi (BPS/Kemendagri) secara bertingkat
    Route::prefix('regional')->group(function () {
        Route::get('/provinces', [RegionalController::class, 'getProvinces']);
        Route::get('/provinces/{province_id}/cities', [RegionalController::class, 'getCities']);
        Route::get('/cities/{city_id}/districts', [RegionalController::class, 'getDistricts']);
        Route::get('/districts/{district_id}/villages', [RegionalController::class, 'getVillages']);
    });

});

Route::middleware('auth:sanctum')->group(function () {
    // 1. Dashboard
    Route::get('/cooperative/dashboard', [CooperativeDashboardController::class, 'getKoperasiData']);

    // 2. Stok & Inventaris
    Route::prefix('cooperative/inventory')->group(function () {
        Route::get('/overview', [InventoryController::class, 'getOverview']);
        Route::post('/request-procurement-ai', [InventoryController::class, 'requestProcurementAI']);
    });

    // 3. Status Distribusi
    Route::prefix('cooperative/distribution')->group(function () {
        Route::get('/history', [DistributionController::class, 'getHistory']);
        Route::put('/{id}/status', [DistributionController::class, 'updateStatus']);
    });

    // 4. Penyaluran (Transaksi)
    Route::prefix('cooperative/transaction')->group(function () {
        Route::post('/check-recommendation', [TransactionController::class, 'checkRecommendation']);
        Route::post('/store', [TransactionController::class, 'storeTransaction']);
    });

    // 5. Laporan
    Route::get('/cooperative/laporan/summary', [LaporanController::class, 'getSummaryLaporan']);
});