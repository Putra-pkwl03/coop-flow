<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Farmer;
use App\Models\Land;

// Nama class disamakan dengan nama file yang baru
class CooperativeDashboardController extends Controller
{
    public function getKoperasiData()
    {
        try {
            $totalPetani = Farmer::count(); 
            $luasLahan = Land::sum('area'); 
            
            $data = [
                'metrics' => [
                    'totalPetani' => $totalPetani,
                    'luasLahan' => (float) $luasLahan,
                    'totalPengajuan' => 12,
                    'distribusiSelesai' => 89,
                ],
                'chartData' => [
                    'months' => ['20 Mei', '27 Mei', '3 Juni', '10 Jun', '17 Jun'],
                    'prediksiCoords' => [70, 55, 20, 35, 10],
                    'stokCoords' => [85, 70, 45, 50, 30],
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Data dashboard koperasi berhasil diambil',
                'data' => $data
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}