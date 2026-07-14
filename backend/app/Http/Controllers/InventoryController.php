<?php

namespace App\Http\Controllers;

use App\Models\Fertilizer;
use App\Models\Procurement;
use App\Services\FastApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class InventoryController extends Controller
{
    protected FastApiService $mlEngine;

    public function __construct(FastApiService $mlEngine)
    {
        $this->mlEngine = $mlEngine;
    }

    public function getOverview(): JsonResponse
    {
        $fertilizers = Fertilizer::all()->map(function ($item) {
            return [
                'id'                => $item->id,
                'fertilizer_code'   => $item->fertilizer_code,
                'name'              => $item->name,
                'current_stock_kg'  => $item->current_stock_kg,
                'packaging_size_kg' => $item->packaging_size_kg ?? 50,
                'price_per_kg'      => $item->price_per_kg,
                'nilai_stok'        => $item->current_stock_kg * $item->price_per_kg,
            ];
        });

        return response()->json([
            'success' => true, 
            'data'    => $fertilizers
        ], 200);
    }

    public function requestProcurementAI(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'fertilizer_id' => 'required|exists:fertilizers,id',
            'stok_tersedia_saat_ini_kg' => 'required|numeric',
            'total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg' => 'required|numeric',
            'provinsi_koperasi' => 'required|string',
            'asumsi_lead_time_hari' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $fertilizer = Fertilizer::findOrFail($request->fertilizer_id);

        // Payload wajib disinkronkan dengan skema Pydantic Model2Request FastAPI
        $payloadML = [
            'jenis_pupuk' => $fertilizer->name,
            'bulan' => Carbon::now()->month,
            'hari_libur_nasional' => 2,
            'stok_tersedia_saat_ini_kg' => (float)$request->stok_tersedia_saat_ini_kg,
            'total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg' => (float)$request->total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg,
            'provinsi_koperasi' => $request->provinsi_koperasi,
            'asumsi_lead_time_hari' => (int)$request->asumsi_lead_time_hari
        ];

        // Tembak microservice FastAPI via HTTP Client
        $responseAI = $this->mlEngine->predictProcurement($payloadML);

        if (!$responseAI || !isset($responseAI['suggested_procurement_kg'])) {
            return response()->json(['success' => false, 'message' => 'Gagal mendapatkan prediksi dari ML Engine'], 502);
        }

        $suggestedKg = $responseAI['suggested_procurement_kg'];
        $kemasanKg = $fertilizer->packaging_size_kg ?? 50;
        $jumlahKarung = ceil($suggestedKg / $kemasanKg); // Pembulatan ke atas untuk jumlah karung fisik

        // Simpan ke workflow pengadaan
        $procurement = Procurement::create([
            'procurement_no' => 'PRC-' . time(),
            'cooperative_id' => $request->user()->cooperative_id ?? 1,
            'fertilizer_id' => $fertilizer->id,
            'quantity_bags' => $jumlahKarung,
            'quantity_kg' => $suggestedKg,
            'status' => 'menunggu_validasi',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rekomendasi kuantitas pengadaan AI berhasil dihitung!',
            'data' => $procurement
        ], 201);
    }
}