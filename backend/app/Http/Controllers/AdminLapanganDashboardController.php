<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use App\Models\Land;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminLapanganDashboardController extends Controller
{
    /**
     * GET /api/admin-lapangan/dashboard
     * Mengembalikan data dashboard khusus untuk Admin Lapangan berdasarkan koperasinya.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $cooperativeId = $user->cooperative_id;
        $today = Carbon::today();

        // -------------------------------------------------------------
        // SCOPE QUERY BERDASARKAN KOPERASI ADMIN LAPANGAN
        // -------------------------------------------------------------
        // Query Dasar Petani di Koperasi ini
        $farmersQuery = Farmer::whereHas('user', function ($q) use ($cooperativeId, $user) {
            if (!$user->hasRole('super-admin')) {
                $q->where('cooperative_id', $cooperativeId);
            }
        });

        // Query Dasar Lahan yang dimiliki Petani di Koperasi ini
        $landsQuery = Land::whereHas('farmer.user', function ($q) use ($cooperativeId, $user) {
            if (!$user->hasRole('super-admin')) {
                $q->where('cooperative_id', $cooperativeId);
            }
        });

        // Query Dasar Tanaman yang ditanam di Lahan Koperasi ini
        $plantsQuery = Plant::whereHas('land.farmer.user', function ($q) use ($cooperativeId, $user) {
            if (!$user->hasRole('super-admin')) {
                $q->where('cooperative_id', $cooperativeId);
            }
        });

        // -------------------------------------------------------------
        // 1. RINGKASAN AKTIVITAS (Metric Cards)
        // -------------------------------------------------------------
        $totalFarmers = (clone $farmersQuery)->count();
        $newFarmersToday = (clone $farmersQuery)->whereDate('created_at', $today)->count();

        $totalLands = (clone $landsQuery)->count();
        $newLandsToday = (clone $landsQuery)->whereDate('created_at', $today)->count();

        $totalPlants = (clone $plantsQuery)->count();
        $newPlantsToday = (clone $plantsQuery)->whereDate('created_at', $today)->count();

        $summary = [
            'farmers' => [
                'total' => $totalFarmers,
                'new_today' => $newFarmersToday,
                'label' => "{$newFarmersToday} data petani baru hari ini"
            ],
            'lands' => [
                'total' => $totalLands,
                'new_today' => $newLandsToday,
                'label' => "{$newLandsToday} lahan yang telah dipetakan hari ini"
            ],
            'commodities' => [
                'total' => $totalPlants,
                'new_today' => $newPlantsToday,
                'label' => "{$newPlantsToday} tanaman baru telah ditambahkan hari ini"
            ]
        ];

        // -------------------------------------------------------------
        // 2. GRAFIK KOMODITAS & STATISTIK CARD
        // -------------------------------------------------------------
        // Mengelompokkan total tanaman di koperasinya berdasarkan nama
        $chartData = (clone $plantsQuery)
            ->select('name as commodity', DB::raw('COUNT(*) as total'))
            ->groupBy('name')
            ->orderByDesc('total')
            ->get();

        // Menhitung komoditas terbanyak per lahan di koperasinya
        $topCommoditiesData = (clone $plantsQuery)
            ->select('name', DB::raw('COUNT(DISTINCT land_id) as total_lands'))
            ->groupBy('name')
            ->orderByDesc('total_lands')
            ->get();

        $topCommoditiesCards = $topCommoditiesData->map(function ($item) use ($totalLands) {
            $percentage = $totalLands > 0 ? round(($item->total_lands / $totalLands) * 100, 1) : 0;
            return [
                'title' => 'Komoditas Terbanyak',
                'name' => $item->name,
                'total_lands' => $item->total_lands,
                'percentage' => $percentage,
                'formatted_subtitle' => "{$item->total_lands} Lahan ({$percentage}%)"
            ];
        });

        // -------------------------------------------------------------
        // 3. AKTIVITAS TERBARU (Filter Scope Koperasi)
        // -------------------------------------------------------------
        $recentLands = (clone $landsQuery)
            ->with('farmer.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($land) {
                $farmerName = $land->farmer->user->name ?? 'Petani';
                return [
                    'type' => 'land_validation',
                    'title' => "Validasi lahan milik {$farmerName}",
                    'description' => $land->location_address ?? 'Lokasi lahan terdaftar',
                    'time' => $land->created_at->format('H.i'),
                    'created_at' => $land->created_at
                ];
            });

        $recentPlants = (clone $plantsQuery)
            ->with('land.farmer.user')
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($plant) {
                $farmerName = $plant->land->farmer->user->name ?? 'Petani';
                return [
                    'type' => 'plant_update',
                    'title' => "Data tanaman {$plant->name} milik {$farmerName} berhasil diperbarui",
                    'description' => $plant->land->location_address ?? 'Lokasi lahan terdaftar',
                    'time' => $plant->updated_at->format('H.i'),
                    'created_at' => $plant->updated_at
                ];
            });

        $recentFarmers = (clone $farmersQuery)
            ->with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($farmer) {
                $farmerName = $farmer->user->name ?? 'Petani';
                return [
                    'type' => 'farmer_added',
                    'title' => 'Data petani baru berhasil ditambahkan',
                    'description' => "Data {$farmerName}",
                    'time' => $farmer->created_at->format('H.i'),
                    'created_at' => $farmer->created_at
                ];
            });

        // Gabungkan dan ambil 5 aktivitas teratas
        $recentActivities = $recentLands->concat($recentPlants)
            ->concat($recentFarmers)
            ->sortByDesc('created_at')
            ->values()
            ->take(5);

        // -------------------------------------------------------------
        // JSON RESPONSE
        // -------------------------------------------------------------
        return response()->json([
            'success' => true,
            'message' => 'Data dashboard admin lapangan berhasil diambil',
            'data' => [
                'summary' => $summary,
                'commodity_chart' => [
                    'chart_series' => $chartData,
                    'top_cards' => $topCommoditiesCards
                ],
                'recent_activities' => $recentActivities
            ]
        ], 200);
    }
}