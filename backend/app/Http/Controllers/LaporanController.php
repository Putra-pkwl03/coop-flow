<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\InventoryMutation;
use Illuminate\Http\JsonResponse;

class LaporanController extends Controller
{
    public function getSummaryLaporan(): JsonResponse
    {
        $totalPendapatan = Transaction::sum('total_price');
        $totalMasuk = InventoryMutation::where('type', 'masuk')->sum('quantity_kg');
        $totalKeluar = InventoryMutation::where('type', 'keluar')->sum('quantity_kg');

        return response()->json([
            'success' => true,
            'summary' => [
                'total_pendapatan_omset_rp' => $totalPendapatan,
                'total_pupuk_masuk_kg' => (float)$totalMasuk,
                'total_pupuk_keluar_kg' => (float)$totalKeluar,
            ]
        ], 200);
    }
}