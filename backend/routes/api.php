<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CooperativeRegistrationController;
use App\Http\Controllers\CooperativeController; 
use App\Http\Controllers\CooperativeDashboardController;
use App\Http\Controllers\DistributionController; 
use App\Http\Controllers\FarmerController; 
use App\Http\Controllers\FarmerGroupController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LaporanController;      
use App\Http\Controllers\ParcelController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\RegionalController;
use App\Http\Controllers\TransactionController;  
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
    
    // Profil & Logout
    Route::get('/user', function (Request $request) {
        return $request->user()->load(['roles', 'cooperative']); 
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Ekosistem Koperasi (Nested Group /cooperative)
    |--------------------------------------------------------------------------
    */
    Route::prefix('cooperative')->group(function () {
        
        // 1. Profil & Dashboard
        Route::put('/profile/complete', [CooperativeController::class, 'updateProfile']);
        Route::get('/dashboard', [CooperativeDashboardController::class, 'getKoperasiData']);
        
        // 2. Stok & Inventaris
        Route::prefix('inventory')->group(function () {
            Route::get('/overview', [InventoryController::class, 'getOverview']);
            Route::get('/history', [InventoryController::class, 'getMutationHistory']);
            Route::post('/mutation', [InventoryController::class, 'storeMutation']);
            Route::post('/request-procurement-ai', [InventoryController::class, 'requestProcurementAI']);
        });

        // 3. Status Distribusi
        Route::prefix('distribution')->group(function () {
            Route::get('/history', [DistributionController::class, 'getHistory']);
            Route::put('/{id}/status', [DistributionController::class, 'updateStatus']);
        });

        // 4. Penyaluran (Transaksi)
        Route::prefix('transaction')->group(function () {
            Route::post('/check-recommendation', [TransactionController::class, 'checkRecommendation']);
            Route::post('/store', [TransactionController::class, 'storeTransaction']);
        });

        // 5. Laporan
        Route::get('/laporan/summary', [LaporanController::class, 'getSummaryLaporan']);
    });

    /*
    |--------------------------------------------------------------------------
    | Modul Kemenko Pangan (Manajemen Koperasi)
    |--------------------------------------------------------------------------
    */
    Route::post('/cooperatives/{id}/activate', [CooperativeController::class, 'activate']);
    Route::apiResource('cooperatives', CooperativeController::class);

    Route::prefix('kemenko/registrations')->group(function () {
        Route::get('/pending', [CooperativeRegistrationController::class, 'getPendingRegistrations']);
        Route::post('/{id}/approve', [CooperativeRegistrationController::class, 'approve']);
        Route::post('/{id}/reject', [CooperativeRegistrationController::class, 'reject']);
    });

    /*
    |--------------------------------------------------------------------------
    | Manajemen Lahan, Petani & Wilayah
    |--------------------------------------------------------------------------
    */
    Route::apiResource('farmer-groups', FarmerGroupController::class);
    Route::post('farmers/{id}', [FarmerController::class, 'update']);
    Route::apiResource('farmers', FarmerController::class);
    Route::delete('/farmers/lands/{landId}', [FarmerController::class, 'destroyLand']);
    
    Route::post('/parcels', [ParcelController::class, 'store']);
    Route::apiResource('plants', PlantController::class);

    // Endpoint data regional (Terproteksi)
    Route::prefix('regional')->group(function () {
        Route::get('/provinces', [RegionalController::class, 'getProvinces']);
        Route::get('/provinces/{province_id}/cities', [RegionalController::class, 'getCities']);
        Route::get('/cities/{city_id}/districts', [RegionalController::class, 'getDistricts']);
        Route::get('/districts/{district_id}/villages', [RegionalController::class, 'getVillages']);
    });

});