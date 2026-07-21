<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use App\Models\Land;
use App\Models\Cooperative;
use App\Models\ProcurementOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DinasDashboardController extends Controller
{
    public function getDinasDashboardData(Request $request): JsonResponse
    {
        $user = $request->user();
        $cityCode = strtolower($user->city_code ?? '');

        // Helper closure: filter Cooperative berdasarkan city_koor milik user Dinas
        $scopeCooperative = function ($query) use ($cityCode) {
            $query->whereRaw('LOWER(city_koor) = ?', [$cityCode]);
        };

        // Helper closure: filter berdasarkan NAMA kota 
        $filterByCityName = function ($q) use ($cityCode) {
            $q->whereRaw('LOWER(name) = ?', [$cityCode]);
        };

        // 1. Agregasi Metrik Utama (di-scope ke wilayah Dinas yang login)
        $totalPetani = Farmer::whereHas('city', $filterByCityName)->count();
        $jumlahLahan = Land::whereHas('city', $filterByCityName)->count();
        $koperasiAktif = Cooperative::where('is_activated', true)
            ->whereRaw('LOWER(city_koor) = ?', [$cityCode])
            ->count();

        $totalPengajuan = ProcurementOrder::whereHas('cooperative', $scopeCooperative)->count();

        // Menggunakan PENDING_DINAS untuk counter badge validasi, tetap di-scope ke wilayah
        $validasiPengadaanCount = ProcurementOrder::where('status_verifikasi', 'PENDING_DINAS')
            ->whereHas('cooperative', $scopeCooperative)
            ->count();

        // --- KALKULASI TREN BULANAN ---
        $startOfThisMonth = Carbon::now()->startOfMonth();
        $endOfThisMonth = Carbon::now()->endOfMonth();
        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        $petaniBulanLalu = Farmer::whereHas('city', $filterByCityName)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $petaniBulanIni = Farmer::whereHas('city', $filterByCityName)
            ->whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])->count();

        $lahanBulanLalu = Land::whereHas('city', $filterByCityName)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $lahanBulanIni = Land::whereHas('city', $filterByCityName)
            ->whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])->count();

        $koperasiBulanLalu = Cooperative::where('is_activated', true)
            ->whereRaw('LOWER(city_koor) = ?', [$cityCode])
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $koperasiBulanIni = Cooperative::where('is_activated', true)
            ->whereRaw('LOWER(city_koor) = ?', [$cityCode])
            ->whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])->count();

        $pengajuanBulanLalu = ProcurementOrder::whereHas('cooperative', $scopeCooperative)
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $pengajuanBulanIni = ProcurementOrder::whereHas('cooperative', $scopeCooperative)
            ->whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])->count();

        $calculateTrend = function ($current, $previous) {
            if ($previous == 0) {
                return $current > 0 ? 100.0 : 0.0;
            }
            return round((($current - $previous) / $previous) * 100, 1);
        };

        $trends = [
            'total_petani' => $calculateTrend($petaniBulanIni, $petaniBulanLalu),
            'jumlah_lahan' => $calculateTrend($lahanBulanIni, $lahanBulanLalu),
            'koperasi_aktif' => $calculateTrend($koperasiBulanIni, $koperasiBulanLalu),
            'total_pengajuan' => $calculateTrend($pengajuanBulanIni, $pengajuanBulanLalu)
        ];

        // 2. Mapping Koordinat Koperasi ke GeoJSON (hanya koperasi di wilayah Dinas ini)
        $petaSebaran = Cooperative::select('id', 'name', 'latitude', 'longitude', 'address')
            ->whereRaw('LOWER(city_koor) = ?', [$cityCode])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(function ($coop) {
                return [
                    'type' => 'Feature',
                    'properties' => [
                        'cooperative_id' => $coop->id,
                        'name' => $coop->name,
                        'address' => $coop->address,
                    ],
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [(float)$coop->longitude, (float)$coop->latitude]
                    ]
                ];
            });

        // 3. Presentase Status Pengajuan (Donut Chart) — hanya PO milik koperasi di wilayah ini
        $statusPengajuan = ProcurementOrder::select('status_verifikasi', DB::raw('count(*) as total'))
            ->whereHas('cooperative', $scopeCooperative)
            ->groupBy('status_verifikasi')
            ->get()
            ->pluck('total', 'status_verifikasi')
            ->toArray();

        $disetujui = $statusPengajuan['disetujui'] ?? 0;
        $menunggu = $statusPengajuan['PENDING_DINAS'] ?? 0;
        $ditolak = $statusPengajuan['ditolak'] ?? 0;
        $totalPencatatan = array_sum($statusPengajuan);
        $lainnya = $totalPencatatan - ($disetujui + $menunggu + $ditolak);

        $donutChart = [
            'total' => $totalPencatatan,
            'disetujui' => $disetujui,
            'menunggu_validasi' => $menunggu,
            'ditolak' => $ditolak,
            'lainnya' => $lainnya
        ];

        // 4. Pengajuan Menunggu Validasi (di wilayah Dinas ini saja)
        $pengajuanMenungguValidasi = ProcurementOrder::with('cooperative:id,name,district,city_koor')
            ->select('id', 'cooperative_id', 'po_number', 'created_at', 'status_verifikasi')
            ->where('status_verifikasi', 'PENDING_DINAS')
            ->whereHas('cooperative', $scopeCooperative)
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'cooperative_name' => $order->cooperative->name ?? 'Koperasi Umum',
                    'po_number' => $order->po_number,
                    'district' => $order->cooperative->district ?? '-',
                    'date' => Carbon::parse($order->created_at)->translatedFormat('d M Y'),
                    'status' => $order->status_verifikasi
                ];
            });

        // 5. Tren Pengajuan Pupuk - 6 Bulan Terakhir (Line Chart) — discope ke wilayah Dinas
        $startOfTrend = Carbon::now()->subMonths(5)->startOfMonth();

        $countsRaw = ProcurementOrder::select(
                DB::raw("TO_CHAR(procurement_orders.created_at, 'YYYY-MM') as year_month"),
                'procurement_orders.status_verifikasi',
                DB::raw('count(*) as total')
            )
            ->join('cooperatives', 'cooperatives.id', '=', 'procurement_orders.cooperative_id')
            ->whereRaw('LOWER(cooperatives.city_koor) = ?', [$cityCode])
            ->where('procurement_orders.created_at', '>=', $startOfTrend)
            ->groupBy('year_month', 'procurement_orders.status_verifikasi')
            ->get();

        $groupedCounts = [];
        foreach ($countsRaw as $row) {
            $groupedCounts[$row->year_month][$row->status_verifikasi] = $row->total;
        }

        $trenPengajuan = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m');
            $monthName = $month->translatedFormat('M Y');

            $trenPengajuan[] = [
                'month' => $monthName,
                'disetujui' => $groupedCounts[$key]['disetujui'] ?? 0,
                'menunggu_validasi' => $groupedCounts[$key]['PENDING_DINAS'] ?? 0,
                'ditolak' => $groupedCounts[$key]['ditolak'] ?? 0,
            ];
        }

        // 6. Pengajuan per Kecamatan — hanya kecamatan yang ada di dalam wilayah Dinas ini
        $pengajuanPerKecamatan = Cooperative::select(
                'cooperatives.district as kecamatan',
                DB::raw('SUM(procurement_orders.total_weight_kg) as total_weight')
            )
            ->join('procurement_orders', 'cooperatives.id', '=', 'procurement_orders.cooperative_id')
            ->whereRaw('LOWER(cooperatives.city_koor) = ?', [$cityCode])
            ->groupBy('cooperatives.district')
            ->orderBy('total_weight', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'kecamatan' => $item->kecamatan ?? 'Luar Daerah',
                    'total_kg' => (float)($item->total_weight ?? 0)
                ];
            });

        // 7. Aktivitas Terbaru — hanya PO dari koperasi di wilayah Dinas ini
        $aktivitasTerbaru = ProcurementOrder::with('cooperative:id,name,city_koor')
            ->select('id', 'cooperative_id', 'po_number', 'status_verifikasi', 'status_logistik', 'updated_at')
            ->whereHas('cooperative', $scopeCooperative)
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(function ($activity) {
                $timeFormatted = Carbon::parse($activity->updated_at)->translatedFormat('d/m/Y H:i');
                $coopName = $activity->cooperative->name ?? 'Koperasi';

                if ($activity->status_logistik === 'selesai') {
                    $description = "Pengajuan {$activity->po_number} telah diterima oleh {$coopName}";
                    $type = 'success';
                } elseif ($activity->status_verifikasi === 'disetujui') {
                    $description = "Pengajuan {$activity->po_number} disetujui oleh Kemenko";
                    $type = 'approved';
                } elseif ($activity->status_verifikasi === 'ditolak') {
                    $description = "Pengajuan {$activity->po_number} telah ditolak";
                    $type = 'danger';
                } else {
                    $description = "Pengajuan {$activity->po_number} dikirim oleh {$coopName}";
                    $type = 'info';
                }

                return [
                    'id' => $activity->id,
                    'description' => $description,
                    'time' => $timeFormatted,
                    'type' => $type
                ];
            });

        return response()->json([
            'success' => true,
            'badges' => [
                'validasi_pengadaan_count' => $validasiPengadaanCount,
            ],
            'metrics' => [
                'total_petani' => $totalPetani,
                'jumlah_lahan' => $jumlahLahan,
                'koperasi_aktif' => $koperasiAktif,
                'total_pengajuan' => $totalPengajuan,
                'trends' => $trends
            ],
            'peta_sebaran' => [
                'type' => 'FeatureCollection',
                'features' => $petaSebaran
            ],
            'donut_chart' => $donutChart,
            'pengajuan_menunggu' => $pengajuanMenungguValidasi,
            'line_chart_tren' => $trenPengajuan,
            'bar_chart_kecamatan' => $pengajuanPerKecamatan,
            'aktivitas_terbaru' => $aktivitasTerbaru
        ], 200);
    }
}