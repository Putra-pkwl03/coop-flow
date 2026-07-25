<?php

namespace App\Http\Controllers;

use App\Models\Fertilizer;
use App\Models\ProcurementOrder;
use App\Models\ProcurementOrderItem;
use App\Services\FastApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage; 
use Carbon\Carbon;

class FertilizerController extends Controller implements HasMiddleware
{
    protected FastApiService $mlEngine;

    // Koordinat Pusat PT Pupuk Indonesia, Jakarta (Pusat Distribusi Utama)
    private const PUSAT_LAT = -6.1953;
    private const PUSAT_LNG = 106.8232;

    // Rata-rata jarak tempuh truk logistik per hari (dalam KM) termasuk istirahat & kendala jalan
    private const TRUCK_KM_PER_DAY = 300;

    public function __construct(FastApiService $mlEngine)
    {
        $this->mlEngine = $mlEngine;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('role:petugas-koperasi', only: ['store', 'update', 'destroy', 'requestAllProcurementAI']),
        ];
    }

    /**
     * Helper Function: Menghitung jarak menggunakan Rumus Haversine (Hasil dalam KM)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; // Radius bumi dalam kilometer

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    /**
     * Get Overview / Ringkasan Stok untuk 5 Card di UI
     */
    public function getOverview(Request $request): JsonResponse
    {
        $cooperativeId = $request->user()->cooperative_id;
        $query = Fertilizer::where('cooperative_id', $cooperativeId);

        return response()->json([
            'success' => true, 
            'message' => 'Ringkasan inventaris stok koperasi berhasil diambil.',
            'data'    => [
                'total_jenis_pupuk'   => (int) $query->count(),     
                'total_stok_kg'       => (float) $query->sum('current_stock_kg'),         
                'nilai_persediaan'    => (float) $query->sum(\DB::raw('current_stock_kg * price_per_kg')),     
                'stok_menipis_jenis'  => (int) $query->clone()->where('status', 'menipis')->count(),         
                'stok_habis_jenis'    => (int) $query->clone()->where('status', 'habis')->count(),          
            ]
        ], 200);
    }

    public function index(Request $request): JsonResponse
    {
        $fertilizers = Fertilizer::where('cooperative_id', $request->user()->cooperative_id)->get();
        return response()->json(['success' => true, 'message' => 'Daftar data pupuk koperasi.', 'data' => $fertilizers], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'packaging_size_kg' => 'nullable|integer|min:1',
            'current_stock_kg'  => 'nullable|integer|min:0',
            'minimum_stock_kg'  => 'nullable|integer|min:0',
            'price_per_kg'      => 'required|integer|min:0',
            'image'             => 'nullable|image|mimes:jpeg,png,jpg|max:5120', 
        ]);

        $data = $request->only(['name', 'packaging_size_kg', 'current_stock_kg', 'minimum_stock_kg', 'price_per_kg']);
        $data['cooperative_id'] = $request->user()->cooperative_id;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('fertilizers', 'public');
            $data['image'] = Storage::url($path);
        }

        $current = $request->input('current_stock_kg', 0);
        $min = $request->input('minimum_stock_kg', 1000);
        
        $data['status'] = ($current <= 0) ? 'habis' : (($current <= $min) ? 'menipis' : 'tersedia');
        $fertilizer = Fertilizer::create($data);

        return response()->json(['success' => true, 'message' => 'Pupuk ditambahkan.', 'data' => $fertilizer], 201);
    }

    public function show(Request $request, Fertilizer $fertilizer): JsonResponse
    {
        if ($fertilizer->cooperative_id !== $request->user()->cooperative_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }
        return response()->json(['success' => true, 'data' => $fertilizer->load('mutations')], 200);
    }

    public function update(Request $request, Fertilizer $fertilizer): JsonResponse
    {
        if ($fertilizer->cooperative_id !== $request->user()->cooperative_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'name'              => 'required|string|max:255',
            'packaging_size_kg' => 'nullable|integer|min:1',
            'current_stock_kg'  => 'nullable|integer|min:0',
            'minimum_stock_kg'  => 'nullable|integer|min:0',
            'price_per_kg'      => 'required|integer|min:0',
            'image'             => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        $data = $request->only(['name', 'packaging_size_kg', 'current_stock_kg', 'minimum_stock_kg', 'price_per_kg']);

        if ($request->hasFile('image')) {
            if ($fertilizer->image) {
                $oldPath = str_replace('/storage/', '', $fertilizer->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $path = $request->file('image')->store('fertilizers', 'public');
            $data['image'] = Storage::url($path);
        }

        $current = $request->input('current_stock_kg', $fertilizer->current_stock_kg);
        $min = $request->input('minimum_stock_kg', $fertilizer->minimum_stock_kg);
        $data['status'] = ($current <= 0) ? 'habis' : (($current <= $min) ? 'menipis' : 'tersedia');

        $fertilizer->update($data);
        return response()->json(['success' => true, 'message' => 'Pupuk diperbarui.', 'data' => $fertilizer], 200);
    }

    public function destroy(Request $request, Fertilizer $fertilizer): JsonResponse
    {
        if ($fertilizer->cooperative_id !== $request->user()->cooperative_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        if ($fertilizer->image) {
            $path = str_replace('/storage/', '', $fertilizer->image);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $fertilizer->delete();
        return response()->json(['success' => true, 'message' => 'Pupuk dihapus.'], 200);
    }

   /**
     * REKAYASA BARU: Otomatisasi Prediksi Pintar dengan Proteksi Overstock & Caching Database
     */
    public function requestAllProcurementAI(Request $request): JsonResponse
    {
        ini_set('memory_limit', '512M');
        set_time_limit(120);

        if (!$request->user()) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir.'], 401);
        }

        $user = $request->user();
        $cooperativeId = $user->cooperative_id;
        $cooperative = $user->cooperative; 
        
        $coopLat = (float) ($cooperative->latitude ?? -7.7956);
        $coopLng = (float) ($cooperative->longitude ?? 110.3695);
        $provinsiKoperasi = (string) ($cooperative->provinsi ?? 'DI Yogyakarta');

        $jarakLogistikKm = $this->calculateDistance(self::PUSAT_LAT, self::PUSAT_LNG, $coopLat, $coopLng);
        $calculatedLeadTime = (int) ceil($jarakLogistikKm / self::TRUCK_KM_PER_DAY) + 1;
        if ($calculatedLeadTime < 2) { $calculatedLeadTime = 2; }

        $fertilizers = Fertilizer::where('cooperative_id', $cooperativeId)->get();
        if ($fertilizers->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Data pupuk kosong.'], 400);
        }

        $predictions = [];
        $totalSuggestedKg = 0;
        $totalSuggestedBags = 0;

        foreach ($fertilizers as $index => $fertilizer) {
            $stokSaatIni = (float) ($fertilizer->current_stock_kg ?? 0.0);
            $stokMin = (float) ($fertilizer->minimum_stock_kg ?? 1000.0);

            // ---------------------------------------------------------------------------
            // PROTEKSI 1: Cek apakah stok masih sangat banyak & aman?
            // ---------------------------------------------------------------------------
            if ($stokSaatIni > ($stokMin * 1.5)) {
                $suggestedKg = 0.0;
                $jumlahKarung = 0;
                $reasonText = "Stok masih melimpah (Aman)";
                $isUsingFallback = false;
                $totalKebutuhanSebulan = 0.0;
            } else {
                // Ambil data transaksi petani 30 hari terakhir
                try {
                $totalKebutuhanSebulan = (float) \DB::table('transaction_ml_logs')
                    ->where('fertilizer_id', $fertilizer->id)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->sum('actual_purchased_kg');
                } catch (\Exception $dbEx) {
                    $totalKebutuhanSebulan = 0.0;
                }

                if ($totalKebutuhanSebulan <= 0) {
                    $totalKebutuhanSebulan = (float) ($stokMin * 1.2); 
                }

                // ---------------------------------------------------------------------------
                // PENYESUAIAN TABLE BARU (PROTEKSI 2):
                // Mengambil sum final_weight_kg dari tabel item yang status induk PO-nya belum 'SELESAI' atau 'DITOLAK'
                // ---------------------------------------------------------------------------
                $pendingProcurementKg = (float) ProcurementOrderItem::where('fertilizer_id', $fertilizer->id)
                    ->whereHas('order', function ($query) use ($cooperativeId) {
                        $query->where('cooperative_id', $cooperativeId)
                              ->whereNotIn('status_logistik', ['SELESAI']) // Status logistik yang masih berjalan
                              ->whereNotIn('status_verifikasi', ['DITOLAK']); // Ambil yang tidak ditolak dinas/kemenko
                    })
                    ->sum('final_weight_kg');

                $payload = [
                    'jenis_pupuk' => (string) ($fertilizer->name ?? 'Urea'),
                    'bulan'       => (int) now()->month,
                    'hari_libur_nasional' => 2, 
                    'stok_tersedia_saat_ini_kg' => $stokSaatIni,
                    'total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg' => $totalKebutuhanSebulan,
                    'provinsi_koperasi'   => $provinsiKoperasi,
                    'asumsi_lead_time_hari' => $calculatedLeadTime 
                ];

                $suggestedKg = 0.0;
                $isUsingFallback = false;

                try {
                    $result = $this->mlEngine->predictProcurement($payload);
                    if (!$result || !isset($result['suggested_procurement_kg'])) {
                        $isUsingFallback = true;
                    } else {
                        $suggestedKg = (float) $result['suggested_procurement_kg'];
                    }
                } catch (\Exception $e) {
                    $isUsingFallback = true;
                }

                if ($isUsingFallback) {
                    $suggestedKg = (float) max(0.0, ($stokMin * 2) - $stokSaatIni);
                }

                // Kurangi rekomendasi pengadaan dengan jumlah barang yang saat ini SEDANG DIKIRIM ke gudang
                if ($pendingProcurementKg > 0) {
                    $suggestedKg = (float) max(0.0, $suggestedKg - $pendingProcurementKg);
                    $reasonText = "Disesuaikan, ada " . $pendingProcurementKg . " Kg dalam pengiriman";
                } else {
                    $reasonText = $isUsingFallback ? "Kalkulasi batas aman (Mekanisme Fallback)" : "Dihitung otomatis oleh ML";
                }

                $beratPerKarung = (int) (($fertilizer->packaging_size_kg > 0) ? $fertilizer->packaging_size_kg : 50);
                $jumlahKarung = (int) ceil($suggestedKg / $beratPerKarung);
            }

            $hargaPerKg = (int) ($fertilizer->price_per_kg ?? 0);
            $beratPerKarung = (int) (($fertilizer->packaging_size_kg > 0) ? $fertilizer->packaging_size_kg : 50);

            $totalSuggestedKg += $suggestedKg;
            $totalSuggestedBags += $jumlahKarung;
            $estimasiTanggalSampai = now()->addDays($calculatedLeadTime)->format('d M Y');

            $metaData = [
                "stok_saat_ini"     => $stokSaatIni . " Kg",
                "prediksi_sebulan"  => $totalKebutuhanSebulan . " Kg",
                "wilayah"           => $provinsiKoperasi,
                "jarak_ke_pusat"    => round($jarakLogistikKm, 1) . " KM",
                "lead_time_sistem"  => $calculatedLeadTime . " Hari",
                "estimasi_sampai"   => $estimasiTanggalSampai, 
                "bulan_analisis"    => now()->format('F Y'),
                "keterangan_sistem" => $reasonText,
                "is_fallback"       => $isUsingFallback
            ];

            // ---------------------------------------------------------------------------
            // STRATEGI UTAMA: Simpan hasil prediksi ke Database (Tabel ai_predictions)
            // ---------------------------------------------------------------------------
            \DB::table('ai_predictions')->updateOrInsert(
                [
                    'cooperative_id' => $cooperativeId,
                    'fertilizer_id'  => $fertilizer->id,
                    'status_saran'   => 'DRAFT'
                ],
                [
                    'suggested_procurement_kg'   => round($suggestedKg, 2),
                    'suggested_procurement_bags' => $jumlahKarung,
                    'analysis_meta'              => json_encode($metaData),
                    'updated_at'                 => now(),
                    'created_at'                 => now()
                ]
            );

            $predictions[] = [
                "id"                         => "pred-" . $fertilizer->id,
                "fertilizer_id"              => $fertilizer->id,
                "name"                       => $fertilizer->name ?? 'Pupuk Tanpa Nama',
                "current_stock_kg"           => $stokSaatIni,
                "suggested_procurement_kg"   => round($suggestedKg, 2),
                "suggested_procurement_bags" => $jumlahKarung,
                "packaging_size_kg"          => $beratPerKarung,
                "price_per_kg"               => $hargaPerKg,
                "harga_per_karung"           => $hargaPerKg * $beratPerKarung,
                "image_url"                  => $fertilizer->image,
                "analysis_meta"              => $metaData
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Prediksi berhasil diperbarui dan disimpan di database.',
            'data' => [
                'overview' => [
                    'total_pengadaan_kg'   => round($totalSuggestedKg, 2),
                    'total_pengadaan_bags' => $totalSuggestedBags,
                    'jenis_pupuk_count'    => count($predictions),
                    'periode_pengadaan'    => now()->format('d M') . ' - ' . now()->addMonths(3)->format('d M Y'), 
                ],
                'items' => $predictions
            ]
        ], 200);
    }
}