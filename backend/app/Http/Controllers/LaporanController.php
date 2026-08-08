<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\InventoryMutation;
use App\Models\Fertilizer;
use App\Models\ProcurementOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LaporanController extends Controller
{
    /**
     * Laporan Summary khusus untuk 1 Koperasi yang sedang Login
     */
    public function getSummaryLaporan(Request $request): JsonResponse
    {
        $user = $request->user();
        $cooperativeId = $user->cooperative_id;

        // Validasi jika user tidak terikat koperasi
        if (!$cooperativeId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. User Anda tidak terdaftar pada koperasi mana pun.'
            ], 403);
        }

        // 1. Total Pendapatan / Omset (Filter via relasi farmer -> cooperative_id)
        $totalPendapatan = Transaction::whereHas('farmer', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            })
            ->where('status', 'success') // Hanya hitung transaksi yang statusnya success
            ->sum('grand_total');

        // 2. Total Mutasi Barang Masuk & Keluar (Kg)
        $totalMasuk = InventoryMutation::whereHas('fertilizer', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            })
            ->where('type', 'masuk')
            ->sum('quantity_kg');

        $totalKeluar = InventoryMutation::whereHas('fertilizer', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            })
            ->where('type', 'keluar')
            ->sum('quantity_kg');

        // 3. Status Stok & Persediaan Gudang Koperasi
        $queryPupuk = Fertilizer::where('cooperative_id', $cooperativeId);
        
        $totalJenisPupuk    = (int) $queryPupuk->count();
        $sisaStokGudangKg   = (float) $queryPupuk->sum('current_stock_kg');
        $nilaiPersediaanRp  = (float) $queryPupuk->sum(DB::raw('current_stock_kg * price_per_kg'));
        
        // Status stok kritis internal
        $stokMenipisCount   = (int) $queryPupuk->clone()->where('status', 'menipis')->count();
        $stokHabisCount     = (int) $queryPupuk->clone()->where('status', 'habis')->count();

        // Status Pengadaan / Purchase Order (PO)
        $poBerjalanCount    = (int) ProcurementOrder::where('cooperative_id', $cooperativeId)
            ->whereNotIn('status_logistik', ['SELESAI'])
            ->whereNotIn('status_verifikasi', ['REJECTED_DINAS', 'REJECTED_KEMENKO'])
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Laporan rekapitulasi internal koperasi berhasil dimuat.',
            'cooperative_id' => $cooperativeId,
            'summary' => [
                // Financial & Penjualan
                'total_pendapatan_omset_rp' => (float) $totalPendapatan,
                'nilai_persediaan_gudang_rp' => $nilaiPersediaanRp,

                // Fisik & Mutasi Gudang
                'total_pupuk_masuk_kg'      => (float) $totalMasuk,
                'total_pupuk_keluar_kg'     => (float) $totalKeluar,
                'sisa_stok_gudang_kg'       => $sisaStokGudangKg,

                // Kondisi Inventaris
                'total_jenis_pupuk'         => $totalJenisPupuk,
                'stok_kritis' => [
                    'menipis' => $stokMenipisCount,
                    'habis'   => $stokHabisCount,
                ],

                // Logistik & Pengadaan PO
                'po_sedang_diproses_count'  => $poBerjalanCount
            ]
        ], 200);
    }


    /**
     * Detail data transaksi dan mutasi untuk tabel laporan
     */
    public function getDetailsLaporan(Request $request): JsonResponse
    {
        $user = $request->user();
        $cooperativeId = $user->cooperative_id;

        if (!$cooperativeId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.'
            ], 403);
        }

        // 1. Ambil data Transaksi Penjualan/Penyaluran Koperasi
        $transactions = Transaction::with(['farmer', 'items.fertilizer'])
            ->whereHas('farmer', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            })
            ->latest()
            ->get();

        // 2. Ambil data Mutasi Stok Gudang Koperasi (Eager load 'farmer' & 'fertilizer' tanpa 'user')
        $mutations = InventoryMutation::with(['fertilizer', 'farmer'])
            ->whereHas('fertilizer', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Detail laporan berhasil dimuat.',
            'transactions' => $transactions,
            'mutations' => $mutations,
        ], 200);
    }
}