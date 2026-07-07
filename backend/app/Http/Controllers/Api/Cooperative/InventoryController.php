<?php

namespace App\Http\Controllers\Api\Cooperative;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use App\Models\Fertilizer;
use App\Models\InventoryMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    /**
     * 1. GET OVERVIEW & TABLE STOK (Untuk Tab 'Stok Saat Ini')
     * Menyuplai 3 Kartu Metrik Atas dan Tabel Ketersediaan sekaligus dalam 1 Request.
     */
    public function getOverview(Request $request)
    {
        // 🚨 Catatan Jangka Panjang: Koperasi ID nantinya diambil dari Auth::user()->cooperative_id.
        // Untuk tahap awal, kita asumsikan Koperasi ID = 1.
        $cooperativeId = 1;

        // Ambil semua gudang milik koperasi ini beserta data pupuk di dalamnya
        $warehouses = Warehouse::where('cooperative_id', $cooperativeId)
            ->with('fertilizers')
            ->get();

        // Ambil semua daftar pupuk untuk tabel utama
        $fertilizers = Fertilizer::whereIn('warehouse_id', $warehouses->pluck('id'))->get();

        // --- KALKULASI DATA UNTUK KARTU METRIK ---
        $totalStok = $fertilizers->sum('current_stock_kg');
        
        // Nilai Stok = SUM(current_stock_kg * price_per_kg)
        $totalNilaiRupiah = $fertilizers->sum(function ($fertilizer) {
            return $fertilizer->current_stock_kg * $fertilizer->price_per_kg;
        });

        $jumlahGudangAktif = $warehouses->count();

        // --- MAPPING STATUS STOK UNTUK TABEL FRONtend ---
        $stockTableData = $fertilizers->map(function ($item) {
            // Tentukan status berdasarkan batas stok minimal
            $status = 'Aman';
            if ($item->current_stock_kg <= 0) {
                $status = 'Kritis';
            } elseif ($item->current_stock_kg <= $item->minimum_stock_kg) {
                $status = 'Waspada';
            }

            return [
                'id' => $item->id,
                'name' => $item->name,
                'current_stock' => $item->current_stock_kg,
                'minimum_stock' => $item->minimum_stock_kg,
                'price_per_kg' => $item->price_per_kg,
                'status' => $status,
                'warehouse_name' => $item->warehouse->name
            ];
        });

        return response()->json([
        'status' => 'success',
        'summary' => [
            'total_stock_kg' => $totalStok,
            'total_value_idr' => $totalNilaiRupiah,
            'active_warehouses' => $jumlahGudangAktif,
        ],
        'stocks' => $stockTableData,
        // 💡 Tambahkan ini agar komponen WarehouseProgress Next.js dapat data kapasitas gudang asli
        'warehouses' => $warehouses->map(function ($wh) {
            return [
                'id' => $wh->id,
                'name' => $wh->name,
                'capacity_kg' => $wh->capacity_kg,
                'used_stock_kg' => $wh->fertilizers->sum('current_stock_kg')
            ];
        })
    ], 200);
    }

    /**
     * 2. GET MUTATION HISTORY (Untuk Tab 'Riwayat Stok')
     * Menampilkan semua log keluar-masuk pupuk terurut dari yang paling baru.
     */
    public function getMutationHistory()
    {
        $cooperativeId = 1;

        // Ambil riwayat mutasi yang pupuknya berada di gudang koperasi ini
        $histories = InventoryMutation::whereHas('fertilizer.warehouse', function ($query) use ($cooperativeId) {
                $query->where('cooperative_id', $cooperativeId);
            })
            ->with(['fertilizer', 'farmer']) // Include data master pupuk & petani (jika ada)
            ->latest() // Urutkan dari transaksi terbaru
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $histories
        ], 200);
    }

    /**
     * 3. POST STORE MUTATION (Aksi Form Tambah/Kurang Stok)
     * Menggunakan DB::transaction() agar data log & nominal stok sinkron tanpa risiko selisih data.
     */
    public function storeMutation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fertilizer_id' => 'required|exists:fertilizers,id',
            'farmer_id'     => 'nullable|exists:farmers,id', // Opsional, terhubung ke model rekanmu jika ada tebusan
            'type'          => 'required|in:masuk,keluar',
            'quantity_kg'   => 'required|integer|min:1',
            'description'   => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            // Mulai transaksi database
            DB::beginTransaction();

            $fertilizer = Fertilizer::findOrFail($request->fertilizer_id);

            // Logika validasi pengurangan: Jangan sampai stok minus jika barang keluar
            if ($request->type === 'keluar' && $fertilizer->current_stock_kg < $request->quantity_kg) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Stok tidak mencukupi untuk melakukan mutasi keluar. Sisa stok: ' . $fertilizer->current_stock_kg . ' kg'
                ], 400);
            }

            // 1. Catat transaksi ke dalam tabel riwayat mutasi
            $mutation = InventoryMutation::create([
                'fertilizer_id' => $request->fertilizer_id,
                'farmer_id'     => $request->farmer_id,
                'type'          => $request->type,
                'quantity_kg'   => $request->quantity_kg,
                'description'   => $request->description,
            ]);

            // 2. Update kuantitas stok berjalan pada tabel pupuk
            if ($request->type === 'masuk') {
                $fertilizer->increment('current_stock_kg', $request->quantity_kg);
            } else {
                $fertilizer->decrement('current_stock_kg', $request->quantity_kg);
            }

            // Jika semua proses aman, kunci perubahan ke database
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Mutasi stok berhasil disimpan dan saldo barang diperbarui.',
                'data' => $mutation
            ], 201);

        } catch (\Exception $e) {
            // Jika di tengah jalan ada error, batalkan semua perubahan secara otomatis
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan mutasi: ' . $e->getMessage()
            ], 500);
        }
    }
}