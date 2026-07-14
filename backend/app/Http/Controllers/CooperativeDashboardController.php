<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use App\Models\Land;
use App\Models\Transaction;
use App\Models\Procurement;
use App\Models\Fertilizer;
use Illuminate\Http\JsonResponse;

class CooperativeDashboardController extends Controller
{
    public function getKoperasiData(): JsonResponse
    {
        // Agregasi metrik untuk widget dashboard
        $totalPetani = Farmer::count();
        $totalLahan = Land::sum('area');
        $transaksiMasuk = Transaction::count();
        $totalPendapatan = Transaction::sum('total_price');
        $distribusiAktif = Procurement::where('status', 'menunggu_validasi')->count();

        // Mapping koordinat ke standar spasial GeoJSON untuk Peta GIS
        $petaSebaran = Land::select('id', 'land_name', 'center_latitude', 'center_longitude', 'area')
            ->whereNotNull('center_latitude')
            ->get()
            ->map(function ($land) {
                return [
                    'type' => 'Feature',
                    'properties' => [
                        'land_id' => $land->id,
                        'name' => $land->land_name,
                        'area' => $land->area
                    ],
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [(float)$land->center_longitude, (float)$land->center_latitude]
                    ]
                ];
            });

        // Kondisi stok gudang real-time & kalkulasi nilai stok (Asset)
        $stokGudang = Fertilizer::all()->map(function ($item) {
            $nilaiStok = $item->current_stock_kg * $item->price_per_kg;
            
            // Hitung status logis sesuai sisa kuantitas
            $status = 'tersedia';
            if ($item->current_stock_kg <= 0) {
                $status = 'habis';
            } elseif ($item->current_stock_kg <= $item->minimum_stock_kg) {
                $status = 'menipis';
            }

            return [
                'id' => $item->id,
                'fertilizer_code' => $item->fertilizer_code ?? 'FPK-' . $item->id,
                'name' => $item->name,
                'current_stock_kg' => $item->current_stock_kg,
                'nilai_stok_rp' => $nilaiStok,
                'status' => $status,
            ];
        });

        return response()->json([
            'success' => true,
            'metrics' => [
                'total_petani' => $totalPetani,
                'total_lahan' => $totalLahan,
                'transaksi_masuk' => $transaksiMasuk,
                'total_pendapatan' => $totalPendapatan,
                'distribusi_aktif' => $distribusiAktif,
            ],
            'peta_sebaran' => [
                'type' => 'FeatureCollection',
                'features' => $petaSebaran
            ],
            'stok_gudang' => $stokGudang
        ], 200);
    }
}