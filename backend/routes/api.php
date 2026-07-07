<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParcelController;
use App\Http\Controllers\FarmerController; 
use App\Http\Controllers\FarmerGroupController;
use App\Http\Controllers\PlantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CooperativeDashboardController;
use App\Http\Controllers\Api\Cooperative\InventoryController;

/*
|--------------------------------------------------------------------------
| Public Routes (Bisa diakses tanpa login)
|--------------------------------------------------------------------------
*/
// Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Wajib login/terautentikasi Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Route bawaan Laravel untuk mengambil profil user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles'); 
    });

    // Route untuk Logout (Hapus Token)
    Route::post('/logout', [AuthController::class, 'logout']);

    // Endpoint CRUD Kelompok Tani
    Route::apiResource('farmer-groups', FarmerGroupController::class);

    // Route API CRUD Master Petani
    Route::apiResource('farmers', FarmerController::class);

    // Route untuk menyimpan Lahan Spasial Baru
    Route::post('/parcels', [ParcelController::class, 'store']);

    // Route untuk kelola tanaman
    Route::apiResource('plants', PlantController::class);

    Route::post('/parcels', [ParcelController::class, 'store']); 

    // untuk dasboard admin koprasi
    Route::get('/cooperative/dashboard', [CooperativeDashboardController::class, 'getKoperasiData']);

    //untuk fitur stok-inventaris
    Route::prefix('cooperative/inventory')->group(function () {
        Route::get('/overview', [InventoryController::class, 'getOverview']);
        Route::get('/history', [InventoryController::class, 'getMutationHistory']);
        Route::post('/mutation', [InventoryController::class, 'storeMutation']);
    });

});    

