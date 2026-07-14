<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\Fertilizer;
use App\Models\InventoryMutation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DistributionController extends Controller
{
    public function getHistory(): JsonResponse
    {
        $history = Procurement::with('fertilizer')->latest()->get();
        return response()->json(['success' => true, 'data' => $history], 200);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak'
        ]);

        DB::beginTransaction();
        try {
            $procurement = Procurement::findOrFail($id);
            $procurement->status = $request->status;
            $procurement->validated_by = $request->user()->id ?? null;
            
            if ($request->status === 'disetujui') {
                $procurement->sent_at = now();
                $procurement->estimated_arrival = now()->addDays(4);

                // Tambahkan Kuantitas ke Stok Utama
                $fertilizer = Fertilizer::findOrFail($procurement->fertilizer_id);
                $fertilizer->current_stock_kg += $procurement->quantity_kg;
                $fertilizer->save();

                // Catat Log Mutasi Masuk
                InventoryMutation::create([
                    'fertilizer_id' => $procurement->fertilizer_id,
                    'type' => 'masuk',
                    'quantity_kg' => $procurement->quantity_kg,
                    'description' => 'Stok masuk dari pengadaan komoditas disetujui, No: ' . $procurement->procurement_no
                ]);
            }

            $procurement->save();
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Status alur distribusi berhasil diperbarui!', 'data' => $procurement], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}