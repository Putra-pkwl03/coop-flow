<?php

namespace App\Http\Controllers;

use App\Models\Land;
use App\Models\Fertilizer;
use App\Models\Transaction;
use App\Models\FertilizerRecommendation;
use App\Models\InventoryMutation;
use App\Services\FastApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    protected FastApiService $mlEngine;

    public function __construct(FastApiService $mlEngine)
    {
        $this->mlEngine = $mlEngine;
    }

    public function checkRecommendation(Request $request): JsonResponse
    {
        $request->validate([
            'farmer_id' => 'required|exists:farmers,id',
            'land_id' => 'required|exists:lands,id',
            'jenis_komoditas' => 'required|string',
            'fase_tanam_saat_ini' => 'required|string'
        ]);

        $land = Land::findOrFail($request->land_id);

        // Struktur payload dicocokkan dengan model1_kebutuhan_pupuk.pkl
        $payloadML = [
            'luas_lahan_hektar' => (float)$land->area,
            'jenis_komoditas' => $request->jenis_komoditas,
            'fase_tanam_saat_ini' => $request->fase_tanam_saat_ini,
            'jenis_pupuk_input' => 'Urea',
            'jumlah_pupuk_fase_sebelumnya_kg' => 50.0,
            'fase_tanam_sebelumnya' => 'Olah Tanah',
            'curah_hujan_mm' => (float)($land->average_monthly_precipitation ?? 120.0),
            'suhu_rata_rata_celcius' => (float)($land->average_temperature ?? 28.0),
            'kelembapan_persen' => (float)($land->average_humidity ?? 80.0)
        ];

        $responseAI = $this->mlEngine->predictFertilizer($payloadML);
        $recommendedDosage = $responseAI['recommended_dosage_kg'] ?? 100.0;

        // Simpan rekam rekomendasi AI ke database
        $recommendation = FertilizerRecommendation::create([
            'farmer_id' => $request->farmer_id,
            'land_id' => $request->land_id,
            'fertilizer_id' => 1,
            'recommended_dosage_kg' => $recommendedDosage,
            'prediction_meta_input' => $payloadML
        ]);

        return response()->json(['success' => true, 'recommended_dosage_kg' => $recommendedDosage, 'cache' => $recommendation], 200);
    }

    public function storeTransaction(Request $request): JsonResponse
    {
        $request->validate([
            'farmer_id' => 'required|exists:farmers,id',
            'payment_method' => 'required|in:cash,transfer,subsidi',
            'amount_paid' => 'required|numeric',
            'items' => 'required|array|min:1',
            'items.*.fertilizer_id' => 'required|exists:fertilizers,id',
            'items.*.quantity_bags' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $totalItems = 0;
            $totalWeight = 0;
            $totalPrice = 0;
            $processedItems = [];

            foreach ($request->items as $itemData) {
                $fertilizer = Fertilizer::findOrFail($itemData['fertilizer_id']);
                $kemasan = $fertilizer->packaging_size_kg ?? 50;
                $beratKg = $itemData['quantity_bags'] * $kemasan;

                if ($fertilizer->current_stock_kg < $beratKg) {
                    throw new \Exception("Stok tidak mencukupi untuk pupuk: " . $fertilizer->name);
                }

                $subtotal = $beratKg * $fertilizer->price_per_kg;

                $totalItems += $itemData['quantity_bags'];
                $totalWeight += $beratKg;
                $totalPrice += $subtotal;

                $processedItems[] = [
                    'fertilizer_id' => $fertilizer->id,
                    'quantity_bags' => $itemData['quantity_bags'],
                    'quantity_kg' => $beratKg,
                    'price_per_kg' => $fertilizer->price_per_kg,
                    'subtotal' => $subtotal,
                    'model' => $fertilizer
                ];
            }

            // Simpan Ringkasan Transaksi Utama
            $transaction = Transaction::create([
                'transaction_no' => 'TRX-' . time() . rand(10,99),
                'farmer_id' => $request->farmer_id,
                'total_items' => $totalItems,
                'total_weight_kg' => $totalWeight,
                'total_price' => $totalPrice,
                'payment_method' => $request->payment_method,
                'amount_paid' => $request->amount_paid
            ]);

            // Simpan Detail Transaksi & Potong Stok Koperasi
            foreach ($processedItems as $item) {
                $transaction->items()->create([
                    'fertilizer_id' => $item['fertilizer_id'],
                    'quantity_bags' => $item['quantity_bags'],
                    'quantity_kg' => $item['quantity_kg'],
                    'price_per_kg' => $item['price_per_kg'],
                    'subtotal' => $item['subtotal']
                ]);

                // Update Stok Fisik
                $fertilizerModel = $item['model'];
                $fertilizerModel->current_stock_kg -= $item['quantity_kg'];
                $fertilizerModel->save();

                // Catat Log Mutasi Keluar
                InventoryMutation::create([
                    'fertilizer_id' => $item['fertilizer_id'],
                    'farmer_id' => $request->farmer_id,
                    'type' => 'keluar',
                    'quantity_kg' => $item['quantity_kg'],
                    'description' => 'Penyaluran pupuk retail selesai, No Invoice: ' . $transaction->transaction_no
                ]);
            }

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Transaksi penyaluran pupuk sukses dan tercatat!', 'data' => $transaction->load('items')], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}