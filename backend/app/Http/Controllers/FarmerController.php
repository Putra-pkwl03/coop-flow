<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use App\Models\User;
use App\Models\Land;
use App\Jobs\ProcessGeeDataJob; 
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage; 
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\FertilizerHistory;

class FarmerController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $query = Farmer::with(['user', 'farmer_group', 'lands.plants', 'village']);

        if (!$user->hasRole('super-admin')) {
            $cooperativeId = $user->cooperative_id;

            $query->whereHas('user', function ($q) use ($cooperativeId) {
                $q->where('cooperative_id', $cooperativeId);
            });
        }

        $farmers = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $farmers
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|unique:users',
            'address' => 'nullable|string',
            
            'farmer_group_id' => 'required|integer|exists:farmer_groups,id',
            'nik' => 'required|string|size:16|unique:farmers',
            'province_id' => 'nullable|string|max:2', 
            'city_id' => 'nullable|string|max:4',
            'district_id' => 'nullable|string|max:7',
            'village_id' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            
            'lands' => 'required|array|min:1',
            'lands.*.land_name' => 'required|string|max:255',
            'lands.*.province_id' => 'nullable|string|max:2', 
            'lands.*.city_id' => 'nullable|string|max:4',
            'lands.*.district_id' => 'nullable|string|max:7',
            'lands.*.village_id' => 'nullable|string|max:10',
            'lands.*.area' => 'required|numeric|min:0',
            'lands.*.unit' => 'required|string|in:Hektar(Ha),Meter Persegi(m2)',
            'lands.*.status' => 'required|string|in:Milik Sendiri,Sewa,Bagi Hasil,Lainnya',

            'lands.*.current_use' => 'nullable|string|max:255',
            'lands.*.soil_type' => 'nullable|string|max:255',
            'lands.*.water_source' => 'nullable|string|max:255',
            'lands.*.irrigation_type' => 'nullable|string|max:255',
            
            'lands.*.ownership_document' => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:2048', 
            'lands.*.location_address' => 'nullable|string',
            'lands.*.polygon_coordinates' => 'nullable|array',
            'lands.*.center_latitude' => 'nullable|numeric',
            'lands.*.center_longitude' => 'nullable|numeric',
            'lands.*.average_temperature' => 'nullable|numeric',
            'lands.*.average_humidity' => 'nullable|integer',
            'lands.*.average_monthly_precipitation' => 'nullable|numeric',
        ], [
            'lands.required' => 'Petani wajib memiliki minimal 1 data lahan.',
            'lands.*.land_name.required' => 'Nama lahan tidak boleh kosong.',
            'farmer_group_id.exists' => 'Kelompok tani yang dipilih tidak valid.',
            'lands.*.ownership_document.mimes' => 'Dokumen kepemilikan lahan harus berformat PDF, PNG, atau JPG.',
            'lands.*.ownership_document.max' => 'Ukuran dokumen lahan tidak boleh melebihi 2MB.'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'cooperative_id' => auth()->user()->cooperative_id ?? null,
            ]);

            $user->assignRole('petani');

            $totalLandArea = collect($request->lands)->sum(function ($land) {
                return $land['area'] ?? 0;
            });

            $farmer = Farmer::create([
                'user_id' => $user->id,
                'farmer_group_id' => $request->farmer_group_id, 
                'nik' => $request->nik,
                'province_id' => $request->province_id,
                'city_id' => $request->city_id,
                'district_id' => $request->district_id,
                'village_id' => $request->village_id,
                'total_land_area' => $totalLandArea, 
                'notes' => $request->notes,
            ]);

            $allLandFiles = $request->file('lands');

            foreach ($request->lands as $index => $landData) {
                $documentPath = null;

                if (isset($allLandFiles[$index]['ownership_document'])) {
                    $file = $allLandFiles[$index]['ownership_document'];
                    $path = $file->store('ownership_documents', 'public');
                    $documentPath = Storage::url($path); 
                }

                $land = $farmer->lands()->create([
                    'land_name' => $landData['land_name'],
                    'province_id' => $landData['province_id'] ?? null,
                    'city_id' => $landData['city_id'] ?? null,
                    'district_id' => $landData['district_id'] ?? null,
                    'village_id' => $landData['village_id'] ?? null,
                    'area' => $landData['area'] ?? 0,
                    'unit' => $landData['unit'] ?? 'Hektar(Ha)',
                    'status' => $landData['status'] ?? 'Milik Sendiri',
                    'current_use' => $landData['current_use'] ?? null,
                    'soil_type' => $landData['soil_type'] ?? null,
                    'water_source' => $landData['water_source'] ?? null,
                    'irrigation_type' => $landData['irrigation_type'] ?? null,
                    'ownership_document' => $documentPath, 
                    'location_address' => $landData['location_address'] ?? null,
                    'polygon_coordinates' => $landData['polygon_coordinates'] ?? null,
                    'center_latitude' => $landData['center_latitude'] ?? null,
                    'center_longitude' => $landData['center_longitude'] ?? null,
                    'average_temperature' => $landData['average_temperature'] ?? null,
                    'average_humidity' => $landData['average_humidity'] ?? null,
                    'average_monthly_precipitation' => $landData['average_monthly_precipitation'] ?? null,
                    'agro_polygon_id' => null, 
                    'current_ndvi' => null 
                ]);

                // Dispatch ProcessGeeDataJob jika koordinat poligon tersedia
                if (!empty($landData['polygon_coordinates'])) {
                    ProcessGeeDataJob::dispatch($land);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data master petani berhasil didaftarkan! Analisis Google Earth Engine sedang diproses di background.',
                'data' => $farmer->load(['user', 'farmer_group', 'lands.plants'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data ke server.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $farmer = Farmer::with([
            'user', 
            'farmer_group', 
            'lands.plants', 
            'province', 'city', 'district', 'village',
            'lands.province', 'lands.city', 'lands.district', 'lands.village'
        ])->find($id);

        if (!$farmer) {
            return response()->json(['message' => 'Petani tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $farmer
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $farmer = Farmer::find($id);
        if (!$farmer) {
            return response()->json(['message' => 'Petani tidak ditemukan'], 404);
        }

        $user = $farmer->user;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|unique:users,phone,' . $user->id,
            'address' => 'nullable|string',
            
            'farmer_group_id' => 'required|integer|exists:farmer_groups,id',
            'nik' => 'required|string|size:16|unique:farmers,nik,' . $farmer->id,
            'province_id' => 'nullable|string|max:2', 
            'city_id' => 'nullable|string|max:4',
            'district_id' => 'nullable|string|max:7',
            'village_id' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            
            'lands' => 'required|array|min:1',
            'lands.*.id' => 'nullable|integer',
            'lands.*.land_name' => 'required|string|max:255',
            'lands.*.province_id' => 'nullable|string|max:2', 
            'lands.*.city_id' => 'nullable|string|max:4',
            'lands.*.district_id' => 'nullable|string|max:7',
            'lands.*.village_id' => 'nullable|string|max:10',
            'lands.*.area' => 'required|numeric|min:0',
            'lands.*.unit' => 'required|string|in:Hektar(Ha),Meter Persegi(m2)',
            'lands.*.status' => 'required|string|in:Milik Sendiri,Sewa,Bagi Hasil,Lainnya',

            'lands.*.current_use' => 'nullable|string',
            'lands.*.soil_type' => 'nullable|string',
            'lands.*.water_source' => 'nullable|string',
            'lands.*.irrigation_type' => 'nullable|string',
            
            'lands.*.ownership_document' => 'nullable', 
            'lands.*.location_address' => 'nullable|string',
            'lands.*.polygon_coordinates' => 'nullable|array', 
            'lands.*.center_latitude' => 'nullable|numeric',
            'lands.*.center_longitude' => 'nullable|numeric',
            'lands.*.average_temperature' => 'nullable|numeric',
            'lands.*.average_humidity' => 'nullable|integer',
            'lands.*.average_monthly_precipitation' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            $keepLandIds = [];
            $allLandFiles = $request->file('lands');

            foreach ($request->lands as $index => $landData) {
                $existingLand = !empty($landData['id']) ? Land::find($landData['id']) : null;
                $documentPath = $existingLand ? $existingLand->ownership_document : null;

                if (isset($allLandFiles[$index]['ownership_document'])) {
                    $file = $allLandFiles[$index]['ownership_document'];
                    
                    if ($existingLand && $existingLand->ownership_document) {
                        $oldPath = str_replace('/storage/', '', $existingLand->ownership_document);
                        Storage::disk('public')->delete($oldPath);
                    }

                    $path = $file->store('ownership_documents', 'public');
                    $documentPath = Storage::url($path);
                } elseif (isset($landData['ownership_document']) && is_string($landData['ownership_document'])) {
                    $documentPath = $landData['ownership_document'];
                }

                // Cek perubahan koordinat poligon via JSON encode agar akurat
                $hasPolygonChanged = false;
                $newCoords = $landData['polygon_coordinates'] ?? null;

                if ($newCoords) {
                    $existingCoordsJson = $existingLand ? json_encode($existingLand->polygon_coordinates) : null;
                    if (!$existingLand || $existingCoordsJson !== json_encode($newCoords)) {
                        $hasPolygonChanged = true;
                    }
                }

                $land = $farmer->lands()->updateOrCreate(
                    ['id' => $landData['id'] ?? null],
                    [
                        'land_name' => $landData['land_name'],
                        'province_id' => $landData['province_id'] ?? ($existingLand->province_id ?? null),
                        'city_id'     => $landData['city_id'] ?? ($existingLand->city_id ?? null),
                        'district_id' => $landData['district_id'] ?? ($existingLand->district_id ?? null),
                        'village_id'  => $landData['village_id'] ?? ($existingLand->village_id ?? null),
                        'area'        => $landData['area'],
                        'unit'        => $landData['unit'],
                        'status'      => $landData['status'],
                        'current_use'     => $landData['current_use'] ?? ($existingLand->current_use ?? null),
                        'soil_type'       => $landData['soil_type'] ?? ($existingLand->soil_type ?? null),
                        'water_source'    => $landData['water_source'] ?? ($existingLand->water_source ?? null),
                        'irrigation_type' => $landData['irrigation_type'] ?? ($existingLand->irrigation_type ?? null),
                        'ownership_document' => $documentPath, 
                        'location_address'   => $landData['location_address'] ?? ($existingLand->location_address ?? null),
                        'polygon_coordinates'           => $newCoords ?? ($existingLand->polygon_coordinates ?? null), 
                        'center_latitude'               => $landData['center_latitude'] ?? ($existingLand->center_latitude ?? null),
                        'center_longitude'              => $landData['center_longitude'] ?? ($existingLand->center_longitude ?? null),
                        'average_temperature'           => $landData['average_temperature'] ?? ($existingLand->average_temperature ?? null),
                        'average_humidity'              => $landData['average_humidity'] ?? ($existingLand->average_humidity ?? null),
                        'average_monthly_precipitation' => $landData['average_monthly_precipitation'] ?? ($existingLand->average_monthly_precipitation ?? null),
                        'current_ndvi'                  => $hasPolygonChanged ? null : ($existingLand->current_ndvi ?? null),
                    ]
                );

                // Dispatch ProcessGeeDataJob jika poligon baru, berubah, atau belum memiliki data NDVI
                if ($hasPolygonChanged || (empty($existingLand->current_ndvi) && !empty($newCoords))) {
                    ProcessGeeDataJob::dispatch($land);
                }
                
                $keepLandIds[] = $land->id;
            }

            // Hapus lahan yang dikeluarkan dari Form Update
            $deletedLands = $farmer->lands()->whereNotIn('id', $keepLandIds)->get();
            foreach ($deletedLands as $dLand) {
                if ($dLand->ownership_document) {
                    $oldPath = str_replace('/storage/', '', $dLand->ownership_document);
                    Storage::disk('public')->delete($oldPath);
                }
                $dLand->delete();
            }

            $totalLandArea = collect($request->lands)->sum('area');

            $farmer->update([
                'farmer_group_id' => $request->farmer_group_id,
                'nik'             => $request->nik,
                'province_id'     => $request->province_id ?? $farmer->province_id,
                'city_id'         => $request->city_id ?? $farmer->city_id,
                'district_id'     => $request->district_id ?? $farmer->district_id,
                'village_id'      => $request->village_id ?? $farmer->village_id,
                'total_land_area' => $totalLandArea,
                'notes'           => $request->notes ?? $farmer->notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data profil petani dan lahan berhasil diperbarui! Analisis Google Earth Engine berjalan di background.',
                'data' => $farmer->load(['user', 'farmer_group', 'lands.plants', 'village'])
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data hasil mapping.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


// // Tambahkan deklarasi method/function ini sebelum variabel $daysBack:
//     public function getNdviHistory(Request $request, $id)
//     {
//         $land = Land::find($id);

//         if (!$land) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Data lahan tidak ditemukan.'
//             ], 404);
//         }

//         $rawCoords = $land->polygon_coordinates;

//         if (empty($rawCoords) || !is_array($rawCoords)) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Lahan belum memiliki koordinat poligon.'
//             ], 400);
//         }

//         // Mengambil parameter rentang hari (default 90 hari)
//         $daysBack = (int) $request->input('days_back', 90);

//         // Cache key unik berdasarkan ID Lahan & Jumlah hari
//         $cacheKey = "land_ndvi_history_{$land->id}_days{$daysBack}";

//         try {
//             $historyData = Cache::remember($cacheKey, now()->addHours(12), function () use ($rawCoords, $daysBack) {
                
//                 // Normalisasi Koordinat ke GeoJSON [Longitude, Latitude]
//                 $fixedCoords = [];
//                 foreach ($rawCoords as $pt) {
//                     $val1 = (float) $pt[0];
//                     $val2 = (float) $pt[1];
                    
//                     // Cek jika Latitude & Longitude terbalik
//                     if ($val1 < 10 && $val2 > 90) {
//                         $fixedCoords[] = [$val2, $val1]; 
//                     } else {
//                         $fixedCoords[] = [$val1, $val2];
//                     }
//                 }
                
//                 // Pastikan Poligon Tertutup (Titik awal == Titik akhir)
//                 if ($fixedCoords[0] !== end($fixedCoords)) {
//                     $fixedCoords[] = $fixedCoords[0];
//                 }

//                 $baseUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', 'http://ml-engine:8000'));

//                 // Tembak endpoint histori NDVI di FastAPI Python
//                 $response = Http::timeout(60)->post("{$baseUrl}/api/v1/land/ndvi-history", [
//                     'coordinates' => $fixedCoords,
//                     'days_back'   => $daysBack,
//                 ]);

//                 if ($response->successful()) {
//                     return $response->json();
//                 }

//                 throw new \Exception("Gagal mengambil data histori NDVI dari FastAPI Service.");
//             });

//             return response()->json([
//                 'success' => true,
//                 'data'    => $historyData['data'] ?? []
//             ], 200);

//         } catch (\Exception $e) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Terjadi kesalahan saat mengambil histori pertumbuhan.',
//                 'error'   => $e->getMessage()
//             ], 500);
//         }
//     } 

//     /**
//      * Mengambil 1 URL Tile Peta NDVI Gabungan untuk Seluruh Lahan
//      */
//     public function getAllLandsNdviTile(Request $request)
//     {
//         $startDate = $request->input('start_date');
//         $endDate = $request->input('end_date');

//         // Ambil semua lahan yang punya koordinat
//         $lands = Land::whereNotNull('polygon_coordinates')->get();

//         if ($lands->isEmpty()) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Belum ada data lahan berkoordinat.'
//             ], 400);
//         }

//         $allPolygons = [];

//         foreach ($lands as $land) {
//             $rawCoords = $land->polygon_coordinates;

//             // FIX 1: Decode manual jika data dari DB masih bertipe String JSON
//             if (is_string($rawCoords)) {
//                 $rawCoords = json_decode($rawCoords, true);
//             }

//             if (empty($rawCoords) || !is_array($rawCoords)) continue;

//             $fixedCoords = [];
//             foreach ($rawCoords as $pt) {
//                 $val1 = (float) $pt[0];
//                 $val2 = (float) $pt[1];

//                 // FIX 2: Cek akurat rentang Latitude Indonesia (-11 s/d 6) & Longitude (95 s/d 141)
//                 // Jika val1 adalah Latitude (negatif), tukar ke [Lng, Lat]
//                 if ($val1 >= -11 && $val1 <= 6 && $val2 >= 95 && $val2 <= 141) {
//                     $fixedCoords[] = [$val2, $val1]; 
//                 } else {
//                     $fixedCoords[] = [$val1, $val2];
//                 }
//             }

//             // Pastikan poligon tertutup (titik awal = titik akhir)
//             if (count($fixedCoords) > 0 && $fixedCoords[0] !== end($fixedCoords)) {
//                 $fixedCoords[] = $fixedCoords[0];
//             }

//             if (count($fixedCoords) >= 4) {
//                 $allPolygons[] = $fixedCoords;
//             }
//         }

//         if (empty($allPolygons)) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Format koordinat lahan tidak valid.'
//             ], 400);
//         }

//         // Cache hasil Tile URL gabungan selama 6 jam
//         $cacheKey = "all_lands_ndvi_tile_" . md5(json_encode($allPolygons)) . "_" . ($startDate ?? 'def') . "_" . ($endDate ?? 'def');

//         try {
//             $tileData = Cache::remember($cacheKey, now()->addHours(6), function () use ($allPolygons, $startDate, $endDate) {
//                 $baseUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', 'http://127.0.0.1:8000'));

//                 $payload = ['polygons' => $allPolygons];
//                 if ($startDate) $payload['start_date'] = $startDate;
//                 if ($endDate) $payload['end_date'] = $endDate;

//                 $response = Http::timeout(60)->post("{$baseUrl}/api/v1/lands/all-ndvi-map-tile", $payload);

//                 if ($response->successful()) {
//                     return $response->json();
//                 }

//                 throw new \Exception("Gagal mengambil Tile Peta NDVI dari FastAPI Service.");
//             });

//             return response()->json([
//                 'success' => true,
//                 'data'    => $tileData['data'] ?? []
//             ], 200);

//         } catch (\Exception $e) {
//             return response()->json([
//                 'success' => false,
//                 'message' => 'Terjadi kesalahan saat memuat peta visual seluruh lahan.',
//                 'error'   => $e->getMessage()
//             ], 500);
//         }
//     }


public function getNdviHistory(Request $request, $id)
{
    $land = Land::find($id);

    if (!$land) {
        return response()->json([
            'success' => false,
            'message' => 'Data lahan tidak ditemukan.'
        ], 404);
    }

    $rawCoords = $land->polygon_coordinates;

    if (is_string($rawCoords)) {
        $rawCoords = json_decode($rawCoords, true);
    }

    if (empty($rawCoords) || !is_array($rawCoords)) {
        return response()->json([
            'success' => false,
            'message' => 'Lahan belum memiliki koordinat poligon.'
        ], 400);
    }

    $daysBack = (int) $request->input('days_back', 90);
    $cacheKey = "land_ndvi_history_{$land->id}_days{$daysBack}";

    try {
        $historyData = Cache::remember($cacheKey, now()->addHours(12), function () use ($rawCoords, $daysBack) {
            
            $fixedCoords = [];
            foreach ($rawCoords as $pt) {
                $val1 = (float) $pt[0];
                $val2 = (float) $pt[1];
                
                if ($val1 >= -11 && $val1 <= 6 && $val2 >= 95 && $val2 <= 141) {
                    $fixedCoords[] = [$val2, $val1]; 
                } else {
                    $fixedCoords[] = [$val1, $val2];
                }
            }
            
            // Penutupan poligon yang aman
            $count = count($fixedCoords);
            if ($count >= 3) {
                $first = $fixedCoords[0];
                $last = $fixedCoords[$count - 1];
                if ($first[0] != $last[0] || $first[1] != $last[1]) {
                    $fixedCoords[] = $first;
                }
            }

            // Default URL diarahkan ke FastAPI di Railway
            $defaultUrl = 'https://fast-api-production-v1.up.railway.app';
            $baseUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', $defaultUrl));

            $response = Http::timeout(60)->post("{$baseUrl}/api/v1/land/ndvi-history", [
                'coordinates' => $fixedCoords,
                'days_back'   => $daysBack,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception("Gagal mengambil data histori NDVI dari FastAPI Service: " . $response->body());
        });

        return response()->json([
            'success' => true,
            'data'    => $historyData['data'] ?? []
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan saat mengambil histori pertumbuhan.',
            'error'   => $e->getMessage()
        ], 500);
    }
} 

public function getAllLandsNdviTile(Request $request)
{
    $startDate = $request->input('start_date');
    $endDate = $request->input('end_date');

    $lands = Land::whereNotNull('polygon_coordinates')->get();

    if ($lands->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'Belum ada data lahan berkoordinat.'
        ], 400);
    }

    $allPolygons = [];

    foreach ($lands as $land) {
        $rawCoords = $land->polygon_coordinates;

        if (is_string($rawCoords)) {
            $rawCoords = json_decode($rawCoords, true);
        }

        if (empty($rawCoords) || !is_array($rawCoords)) continue;

        $fixedCoords = [];
        foreach ($rawCoords as $pt) {
            $val1 = (float) $pt[0];
            $val2 = (float) $pt[1];

            if ($val1 >= -11 && $val1 <= 6 && $val2 >= 95 && $val2 <= 141) {
                $fixedCoords[] = [$val2, $val1]; 
            } else {
                $fixedCoords[] = [$val1, $val2];
            }
        }

        $count = count($fixedCoords);
        if ($count >= 3) {
            $first = $fixedCoords[0];
            $last = $fixedCoords[$count - 1];
            if ($first[0] != $last[0] || $first[1] != $last[1]) {
                $fixedCoords[] = $first;
            }
            $allPolygons[] = $fixedCoords;
        }
    }

    if (empty($allPolygons)) {
        return response()->json([
            'success' => false,
            'message' => 'Format koordinat lahan tidak valid.'
        ], 400);
    }

    $cacheKey = "all_lands_ndvi_tile_" . md5(json_encode($allPolygons)) . "_" . ($startDate ?? 'def') . "_" . ($endDate ?? 'def');

    try {
        $tileData = Cache::remember($cacheKey, now()->addHours(6), function () use ($allPolygons, $startDate, $endDate) {
            
            // Default URL diarahkan ke FastAPI di Railway
            $defaultUrl = 'https://fast-api-production-v1.up.railway.app';
            $baseUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', $defaultUrl));

            $payload = ['polygons' => $allPolygons];
            if ($startDate) $payload['start_date'] = $startDate;
            if ($endDate) $payload['end_date'] = $endDate;

            $response = Http::timeout(60)->post("{$baseUrl}/api/v1/lands/all-ndvi-map-tile", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            throw new \Exception("Gagal mengambil Tile Peta NDVI dari FastAPI Service: " . $response->body());
        });

        return response()->json([
            'success' => true,
            'data'    => $tileData['data'] ?? []
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan saat memuat peta visual seluruh lahan.',
            'error'   => $e->getMessage()
        ], 500);
    }
}

    public function destroy($id)
    {
        $farmer = Farmer::find($id);
        if (!$farmer) {
            return response()->json(['message' => 'Petani tidak ditemukan'], 404);
        }

        DB::beginTransaction();

        try {
            $user = User::find($farmer->user_id);
            
            foreach ($farmer->lands as $land) {
                if ($land->ownership_document) {
                    $oldPath = str_replace('/storage/', '', $land->ownership_document);
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $farmer->lands()->delete();
            $farmer->delete();
            
            if ($user) {
                $user->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data master petani beserta akun user dan seluruh aset lahannya berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data petani secara bersih.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroyLand($landId)
    {
        DB::beginTransaction();

        try {
            $land = Land::find($landId);
            if (!$land) {
                return response()->json(['message' => 'Data lahan tidak ditemukan'], 404);
            }

            $farmer = $land->farmer;

            if ($land->ownership_document) {
                $oldPath = str_replace('/storage/', '', $land->ownership_document);
                Storage::disk('public')->delete($oldPath);
            }

            $land->delete();

            if ($farmer) {
                $newTotalArea = $farmer->lands()->sum('area');
                $farmer->update(['total_land_area' => $newTotalArea]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Lahan berhasil dihapus tunggal, total area petani telah diperbarui.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus lahan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
 * Mengambil daftar lahan milik petani yang sedang login (untuk tampilan mobile/dashboard).
 */
    public function getMyLands(Request $request)
    {
        try {
            $user = $request->user();

            // Cari profil petani berdasarkan user_id yang sedang login
            $farmer = Farmer::with(['lands.plants'])->where('user_id', $user->id)->first();

            if (!$farmer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data profil petani tidak ditemukan.',
                    'data' => []
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat data lahan petani.',
                'data' => $farmer->lands
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data lahan.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getDashboardSummary(Request $request)
    {
        try {
            $user = $request->user();

            // 1. Ambil data petani yang sedang login beserta relasinya
            $farmer = Farmer::with([
                'lands.plants', 
                'village'
            ])->where('user_id', $user->id)->first();

            if (!$farmer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data profil petani tidak ditemukan.'
                ], 404);
            }

            // 2. Hitung Ringkasan Saya (Real Data dari DB)
            // A. Total Luas Lahan (Ha)
            $totalLandArea = $farmer->lands->sum('area');

            // B. Total Pupuk Diterima (Kg) & Total Riwayat Transaksi
            // 🟢 PERBAIKAN: Gunakan $user->id karena transactions.farmer_id menyimpan ID User
            $totalFertilizerReceived = DB::table('transaction_items')
                ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->where('transactions.farmer_id', $user->id) // 👈 Kembalikan ke $user->id
                ->sum('transaction_items.actual_purchased_kg') ?? 0;

            $totalTransactions = DB::table('transactions')
                ->where('farmer_id', $user->id) // 👈 Kembalikan ke $user->id
                ->count();

            // C. Komoditas Utama (Berdasarkan jenis tanaman terbanyak di lahan milik petani ini)
            $mainCommodity = DB::table('plants')
                ->join('lands', 'plants.land_id', '=', 'lands.id')
                ->where('lands.farmer_id', $farmer->id) // 👈 Lahan menggunakan $farmer->id
                ->select('plants.name', DB::raw('count(*) as total'))
                ->groupBy('plants.name')
                ->orderByDesc('total')
                ->value('plants.name') ?? 'Belum Ada';

            // 3. Aktivitas Terbaru (Log Gabungan Transaksi & Pendaftaran Lahan)
            $transactionLogs = DB::table('transactions')
                ->where('farmer_id', $user->id) // 👈 Gunakan $user->id
                ->select(
                    'id',
                    DB::raw("'fertilizer' as type"),
                    DB::raw("CONCAT('Penebusan Pupuk (Rp ', amount_paid, ')') as title"),
                    DB::raw("CONCAT('Metode: ', payment_method) as description"),
                    'created_at'
                );

            $landLogs = DB::table('lands')
                ->where('farmer_id', $farmer->id) // 👈 Lahan menggunakan $farmer->id
                ->select(
                    'id',
                    DB::raw("'land' as type"),
                    DB::raw("CONCAT('Lahan ', land_name, ' telah didaftarkan') as title"),
                    DB::raw("CONCAT('Luas: ', area, ' ', unit) as description"),
                    'created_at'
                );

            $recentActivities = $transactionLogs->union($landLogs)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get()
                ->map(function ($act) {
                    return [
                        'id' => $act->id,
                        'type' => $act->type,
                        'title' => $act->title,
                        'description' => $act->description,
                        'date' => \Carbon\Carbon::parse($act->created_at)->isoFormat('D MMMM YYYY HH:mm'),
                    ];
                });

            // 4. Data Kalender Real (Jadwal Tanam & Pemupukan)
            $plantingCalendar = [];
            if (DB::getSchemaBuilder()->hasTable('plants')) {
                $plantingCalendar = DB::table('plants')
                    ->join('lands', 'plants.land_id', '=', 'lands.id')
                    ->where('lands.farmer_id', $farmer->id)
                    ->whereNotNull('planting_date')
                    ->select(
                        'plants.id',
                        'plants.name as plant_name',
                        'plants.planting_date as date',
                        'plants.current_phase as phase'
                    )
                    ->get();
            }

            $fertilizerCalendar = [];
            if (DB::getSchemaBuilder()->hasTable('fertilizer_schedules')) {
                $fertilizerCalendar = DB::table('fertilizer_schedules')
                    ->join('lands', 'fertilizer_schedules.land_id', '=', 'lands.id')
                    ->where('lands.farmer_id', $farmer->id)
                    ->select(
                        'fertilizer_schedules.id',
                        'fertilizer_schedules.fertilizer_name',
                        'fertilizer_schedules.schedule_date as date',
                        'fertilizer_schedules.stage'
                    )
                    ->get();
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memuat data dashboard petani.',
                'data' => [
                    'profile' => [
                        'name' => $user->name,
                        'role' => 'Petani',
                        'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                        'village' => $farmer->village->name ?? 'N/A',
                    ],
                    'summary' => [
                        'total_land_ha' => (float) round($totalLandArea, 2),
                        'fertilizer_received_kg' => (float) round($totalFertilizerReceived, 2),
                        'total_transactions' => (int) $totalTransactions,
                        'main_commodity' => $mainCommodity,
                    ],
                    'recent_activities' => $recentActivities,
                    'calendars' => [
                        'planting' => $plantingCalendar,
                        'fertilizer' => $fertilizerCalendar,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dashboard.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Mengambil daftar pupuk yang tersedia di koperasi tempat petani terdaftar.
     */
    public function getCooperativeFertilizers(Request $request)
    {
        try {
            $user = $request->user();

            // 1. Dapatkan cooperative_id dari user petani yang sedang login
            $cooperativeId = $user->cooperative_id;

            if (!$cooperativeId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Petani tidak terhubung dengan koperasi manapun.',
                    'data' => []
                ], 404);
            }

            // 2. Query pupuk berdasarkan cooperative_id milik petani
            $fertilizers = \App\Models\Fertilizer::where('cooperative_id', $cooperativeId)
                ->where('status', 'tersedia') // Menampilkan yang statusnya tersedia
                ->get()
                ->map(function ($fertilizer) {
                    return [
                        'id' => $fertilizer->id,
                        'fertilizer_code' => $fertilizer->fertilizer_code,
                        'name' => $fertilizer->name,
                        'image' => $fertilizer->image ? Storage::url($fertilizer->image) : null,
                        'packaging_size_kg' => (float) $fertilizer->packaging_size_kg,
                        'current_stock_kg' => (float) $fertilizer->current_stock_kg,
                        'price_per_kg' => (float) $fertilizer->price_per_kg,
                        'status' => $fertilizer->status,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil daftar pupuk di koperasi.',
                'data' => $fertilizers
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pupuk koperasi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil daftar pupuk yang khusus pernah ditransaksikan oleh petani yang sedang login.
     */
    public function getMyFertilizers(Request $request)
    {
        try {
            $user = $request->user();

            // Ambil TransactionItem berdasarkan farmer_id (user->id) pada tabel transactions
            $myFertilizers = \App\Models\TransactionItem::whereHas('transaction', function ($q) use ($user) {
                    $q->where('farmer_id', $user->id);
                })
                ->with('fertilizer') // Load relasi fertilizer
                ->get()
                ->pluck('fertilizer') // Ambil objek fertilizer-nya
                ->filter()            // Jaga-jaga jika ada relasi yang null
                ->unique('id')        // Hilangkan duplikasi pupuk
                ->values()
                ->map(function ($fertilizer) {
                    return [
                        'id' => $fertilizer->id,
                        'fertilizer_code' => $fertilizer->fertilizer_code,
                        'name' => $fertilizer->name,
                        'packaging_size_kg' => (float) $fertilizer->packaging_size_kg,
                        'price_per_kg' => (float) $fertilizer->price_per_kg,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil daftar pupuk milik petani.',
                'data' => $myFertilizers
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pupuk petani.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


/**
     * Mengambil riwayat transaksi pembelian pupuk milik petani yang sedang login.
     */
    public function getMyTransactions(Request $request)
    {
        try {
            $user = $request->user();

            // 1. Filter opsional berdasarkan status (jika ada kolom status)
            $status = $request->query('status');

            // 2. Query transaksi langsung berdasarkan ID user yang login
            //    Menggunakan relasi 'items.fertilizer' sesuai yang ada pada method store()
            $query = Transaction::with(['items.fertilizer'])
                ->where('farmer_id', $user->id)
                ->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            // 3. Paginate data
            $transactions = $query->paginate(10);

            // 4. Format struktur JSON agar rapi dan sesuai dengan kolom di database
            $formattedData = $transactions->getCollection()->map(function ($trx) {
                return [
                    'id'               => $trx->id,
                    'invoice_number'   => $trx->invoice_number ?? 'TRX-' . $trx->id,
                    'transaction_date' => $trx->created_at ? $trx->created_at->format('Y-m-d H:i:s') : null,
                    'total_amount'     => (float) $trx->amount_paid, // Sesuai dengan kolom amount_paid pada store()
                    'payment_method'   => $trx->payment_method ?? 'Cash',
                    'status'           => $trx->status ?? 'completed',
                    'items_summary'    => $trx->items->map(function ($item) {
                        $packageName = $item->fertilizer->name ?? 'Pupuk';
                        $size        = (float) ($item->fertilizer->packaging_size_kg ?? 50);
                        $qtyKg       = (float) $item->actual_purchased_kg; // Sesuai kolom actual_purchased_kg pada store()
                        $sacks       = $size > 0 ? floor($qtyKg / $size) : 0;

                        return [
                            'fertilizer_id'   => $item->fertilizer_id,
                            'fertilizer_name' => $packageName,
                            'quantity_kg'     => $qtyKg,
                            'quantity_sacks'  => $sacks,
                            'price_per_kg'    => (float) $item->price_per_kg,
                            'subtotal'        => (float) $item->subtotal
                        ];
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil riwayat transaksi pembelian pupuk.',
                'data'    => $formattedData,
                'pagination' => [
                    'current_page' => $transactions->currentPage(),
                    'last_page'    => $transactions->lastPage(),
                    'per_page'     => $transactions->perPage(),
                    'total'        => $transactions->total(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat transaksi.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

/**
     * Mengambil detail satu transaksi spesifik milik petani.
     */
    public function getTransactionDetail(Request $request, $id)
    {
        try {
            $user = $request->user();

            $transaction = Transaction::with(['items.fertilizer', 'mlLogs'])
                ->where('id', $id)
                ->where('farmer_id', $user->id)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan.',
                    'data'    => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Detail transaksi ditemukan.',
                'data'    => $transaction
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail transaksi.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

 

    public function getFertilizerRecommendation(Request $request, $landId, FastApiService $fastApiService)
    {
        // 1. Load data lahan beserta tanaman terkait
        $land = Land::with(['farmer', 'plants' => function($query) {
            $query->latest(); 
        }])->find($landId);

        if (!$land) {
            return response()->json([
                'success' => false,
                'message' => 'Lahan tidak ditemukan'
            ], 404);
        }

        $latestPlant = $land->plants->first();

        // 2. Konversi luas lahan ke hektar
        $areaInHectares = (float) $land->area;
        $unitCleaned = strtolower(str_replace(' ', '', $land->unit));
        
        if (str_contains($unitCleaned, 'm2') || str_contains($unitCleaned, 'meterpersegi')) {
            $areaInHectares = $areaInHectares / 10000;
        }

        // --- LOGIKA FALLBACK JIKA LAHAN BARU BELUM MEMILIKI RIWAYAT TANAMAN/PUPUK ---
        $komoditasDefault = $latestPlant ? $latestPlant->name : 'Padi';
        $faseDefault = $latestPlant ? $latestPlant->current_phase : 'Vegetatif';
        $jenisPupuk = $request->input('jenis_pupuk_input', $latestPlant->last_fertilizer_type ?? 'NPK');
        
        // FIX: Ambil dari input request atau fallback ke database
        $jumlahPupukSebelumnya = (float) $request->input(
            'jumlah_pupuk_fase_sebelumnya_kg', 
            (float) ($latestPlant->last_fertilizer_amount ?? 0.0)
        );
        $faseSebelumnya = $request->input('fase_tanam_sebelumnya', $latestPlant->last_phase ?? 'Tidak Ada');

        // 3. Susun payload untuk FastAPI
        $payload = [
            "luas_lahan_hektar"               => $areaInHectares,
            "jenis_komoditas"                 => $request->input('jenis_komoditas', $komoditasDefault), 
            "fase_tanam_saat_ini"             => $request->input('fase_tanam_saat_ini', $faseDefault),
            "jenis_pupuk_input"               => $jenisPupuk, 
            "jumlah_pupuk_fase_sebelumnya_kg" => $jumlahPupukSebelumnya, // FIX: Menghilangkan variabel typo
            "fase_tanam_sebelumnya"           => $faseSebelumnya,
            "curah_hujan_mm"                  => (float) ($land->average_monthly_precipitation ?? 150.0),
            "suhu_rata_rata_celcius"          => (float) ($land->average_temperature ?? 27.0),
            "kelembapan_persen"               => (int) ($land->average_humidity ?? 80),
        ];

        // 4. Kirim ke Python FastAPI
        $result = $fastApiService->predictFertilizer($payload);

        if (!$result || !isset($result['recommended_dosage_kg'])) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendapatkan prediksi dari Engine ML. Pastikan Service Engine ML berjalan.'
            ], 502);
        }

        $recommendedKg = (float) $result['recommended_dosage_kg'];

        // 🔒 Ambil data pupuk HANYA milik koperasi user login agar spek karung (50 kg) presisi
        $cooperativeId = $request->user() ? $request->user()->cooperative_id : $land->cooperative_id;
        
        // Kita gunakan first() jika hanya butuh 1 pupuk teratas agar tidak duplikat record
        $dbFertilizers = \App\Models\Fertilizer::where('cooperative_id', $cooperativeId)
                            ->where('name', 'LIKE', '%' . $jenisPupuk . '%')
                            ->get();

        $recommendations = [];

        if ($dbFertilizers->isNotEmpty()) {
            foreach ($dbFertilizers as $index => $dbFertilizer) {
                $beratPerKarung = (int) ($dbFertilizer->packaging_size_kg > 0 ? $dbFertilizer->packaging_size_kg : 50);
                $hargaPerKg = (int) $dbFertilizer->price_per_kg;
                $hargaPerKarung = $hargaPerKg * $beratPerKarung;

                // --- KALKULASI UTUH & ECERAN ---
                $fullBags = (int) floor($recommendedKg / $beratPerKarung); // Jumlah Karung Utuh
                $remainingKg = round(fmod($recommendedKg, $beratPerKarung), 2); // Sisa Kg (Eceran)
                $totalBagsCeil = (int) ceil($recommendedKg / $beratPerKarung); // Total Karung Pembulatan ke Atas

                // Estimasi Total Harga (Sisa Kg dihitung per-kg)
                $totalEstimatedPrice = ($fullBags * $hargaPerKarung) + ($remainingKg * $hargaPerKg);

                $recommendations[] = [
                    "id" => "rec-" . $landId . "-" . ($index + 1),
                    "fertilizer_id" => $dbFertilizer->id,
                    "fertilizer_code" => $dbFertilizer->fertilizer_code,
                    "nama" => $dbFertilizer->name,
                    "fungsi" => "Optimasi nutrisi untuk fase " . $payload['fase_tanam_saat_ini'] . " (Kemasan " . $beratPerKarung . " Kg)",
                    "price_per_kg" => $hargaPerKg,
                    "harga_per_karung" => $hargaPerKarung,
                    
                    // --- KEBUTUHAN UTAMA FE (DISPLAY REKOMENDASI) ---
                    "total_recommended_kg" => round($recommendedKg, 2), // Misal: 120 Kg
                    "full_bags_count"      => $fullBags,                 // Misal: 2 Karung
                    "remaining_kg"         => $remainingKg,              // Misal: 20 Kg
                    "formatted_text"       => "{$fullBags} Karung ({$beratPerKarung}kg)" . ($remainingKg > 0 ? " + {$remainingKg} Kg" : ""), 
                    // Result text contoh: "2 Karung (50kg) + 20 Kg"

                    "jumlah_karung" => $totalBagsCeil, // Tetap disajikan jika FE butuh hitungan opsi pembulatan penuh
                    "total_estimated_price" => round($totalEstimatedPrice),
                    
                    "is_ml" => true,
                    "packaging_size_kg" => $beratPerKarung,
                    "image_url" => $dbFertilizer->image,
                    
                    "analysis_meta" => [
                        "luas_lahan" => $payload['luas_lahan_hektar'] . " Ha",
                        "komoditas" => $payload['jenis_komoditas'],
                        "fase_tanam" => $payload['fase_tanam_saat_ini'],
                        "suhu" => $payload['suhu_rata_rata_celcius'] . "°C",
                        "kelembapan" => $payload['kelembapan_persen'] . "%",
                        "curah_hujan" => $payload['curah_hujan_mm'] . " mm",
                    ]
                ];
            }
        } else {
            // Fallback jika tidak ada data sama sekali di DB
            $fallbackVariations = [
                ["berat" => 50, "harga_kg" => 3000],
            ];

            foreach ($fallbackVariations as $index => $var) {
                $beratPerKarung = $var['berat'];
                $fullBags = (int) floor($recommendedKg / $beratPerKarung);
                $remainingKg = round(fmod($recommendedKg, $beratPerKarung), 2);
                $totalBagsCeil = (int) ceil($recommendedKg / $beratPerKarung);

                $recommendations[] = [
                    "id" => "rec-" . $landId . "-fallback-" . ($index + 1),
                    "fertilizer_id" => null,
                    "fertilizer_code" => "RAW-" . strtoupper($jenisPupuk) . "-" . $var['berat'] . "KG",
                    "nama" => "Pupuk " . $jenisPupuk . " " . $var['berat'] . "kg",
                    "fungsi" => "Optimasi nutrisi untuk fase " . $payload['fase_tanam_saat_ini'] . " (Kemasan Fallback " . $var['berat'] . " Kg)",
                    "price_per_kg" => $var['harga_kg'],
                    "harga_per_karung" => $var['harga_kg'] * $var['berat'],
                    
                    // --- KEBUTUHAN UTAMA FE ---
                    "total_recommended_kg" => round($recommendedKg, 2),
                    "full_bags_count"      => $fullBags,
                    "remaining_kg"         => $remainingKg,
                    "formatted_text"       => "{$fullBags} Karung ({$beratPerKarung}kg)" . ($remainingKg > 0 ? " + {$remainingKg} Kg" : ""),
                    
                    "jumlah_karung" => $totalBagsCeil,
                    "is_ml" => false,
                    "packaging_size_kg" => $var['berat'],
                    "image_url" => null,
                    
                    "analysis_meta" => [
                        "luas_lahan" => $payload['luas_lahan_hektar'] . " Ha",
                        "komoditas" => $payload['jenis_komoditas'],
                        "fase_tanam" => $payload['fase_tanam_saat_ini'],
                        "suhu" => $payload['suhu_rata_rata_celcius'] . "°C",
                        "kelembapan" => $payload['kelembapan_persen'] . "%",
                        "curah_hujan" => $payload['curah_hujan_mm'] . " mm",
                    ]
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Rekomendasi pupuk berhasil dihitung!',
            'data' => [
                'recommendations' => $recommendations
            ]
        ], 200);
    }



    /**
     * Menampilkan daftar riwayat pemupukan (bisa di-filter berdasarkan land_id atau farmer_id)
     */
    public function getFertilizerHistories(Request $request)
    {
        $query = FertilizerHistory::with(['farmer.user', 'land', 'plant']);

        // Filter opsional
        if ($request->has('farmer_id')) {
            $query->where('farmer_id', $request->farmer_id);
        }

        if ($request->has('land_id')) {
            $query->where('land_id', $request->land_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $histories = $query->latest('application_date')->get();

        return response()->json([
            'success' => true,
            'data'    => $histories
        ], 200);
    }

    /**
     * Menyimpan data riwayat/pengajuan pemupukan baru
     */
    public function storeFertilizerHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'farmer_id'        => 'required|integer|exists:farmers,id',
            'land_id'          => 'required|integer|exists:lands,id',
            'plant_id'         => 'nullable|integer|exists:plants,id',
            'fertilizer_name'  => 'required|string|max:255',
            'amount'           => 'required|numeric|min:0.01',
            'unit'             => 'required|string|in:kg,gram,liter',
            'application_date' => 'required|date',
            'phase'            => 'nullable|string|max:100',
            'status'           => 'nullable|string|in:submitted,approved,applied,rejected',
            'notes'            => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $history = FertilizerHistory::create([
                'farmer_id'        => $request->farmer_id,
                'land_id'          => $request->land_id,
                'plant_id'         => $request->plant_id,
                'fertilizer_name'  => $request->fertilizer_name,
                'amount'           => $request->amount,
                'unit'             => $request->unit ?? 'kg',
                'application_date' => $request->application_date,
                'phase'            => $request->phase,
                'status'           => $request->status ?? 'submitted',
                'notes'            => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Riwayat pemupukan berhasil dicatat!',
                'data'    => $history->load(['farmer.user', 'land', 'plant'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan riwayat pemupukan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Memperbarui data riwayat pemupukan
     */
    public function updateFertilizerHistory(Request $request, $id)
    {
        $history = FertilizerHistory::find($id);

        if (!$history) {
            return response()->json([
                'success' => false,
                'message' => 'Riwayat pemupukan tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'farmer_id'        => 'required|integer|exists:farmers,id',
            'land_id'          => 'required|integer|exists:lands,id',
            'plant_id'         => 'nullable|integer|exists:plants,id',
            'fertilizer_name'  => 'required|string|max:255',
            'amount'           => 'required|numeric|min:0.01',
            'unit'             => 'required|string|in:kg,gram,liter',
            'application_date' => 'required|date',
            'phase'            => 'nullable|string|max:100',
            'status'           => 'required|string|in:submitted,approved,applied,rejected',
            'notes'            => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $history->update([
                'farmer_id'        => $request->farmer_id,
                'land_id'          => $request->land_id,
                'plant_id'         => $request->plant_id,
                'fertilizer_name'  => $request->fertilizer_name,
                'amount'           => $request->amount,
                'unit'             => $request->unit,
                'application_date' => $request->application_date,
                'phase'            => $request->phase,
                'status'           => $request->status,
                'notes'            => $request->notes,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Riwayat pemupukan berhasil diperbarui!',
                'data'    => $history->load(['farmer.user', 'land', 'plant'])
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui data pemupukan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Menghapus riwayat pemupukan
     */
    public function destroyFertilizerHistory($id)
    {
        $history = FertilizerHistory::find($id);

        if (!$history) {
            return response()->json([
                'success' => false,
                'message' => 'Riwayat pemupukan tidak ditemukan.'
            ], 404);
        }

        try {
            $history->delete();

            return response()->json([
                'success' => true,
                'message' => 'Riwayat pemupukan berhasil dihapus.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus riwayat pemupukan.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}