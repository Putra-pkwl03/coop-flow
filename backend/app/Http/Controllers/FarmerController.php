<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use App\Models\User;
use App\Models\Land;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage; 

class FarmerController extends Controller
{
    public function index()
    {
        $farmers = Farmer::with(['user', 'farmer_group', 'lands.plants', 'village'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $farmers
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Validasi Akun User
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|unique:users',
            'address' => 'nullable|string',
            
            // Validasi Kelompok Tani, Profil & Wilayah Petani
            'farmer_group_id' => 'required|integer|exists:farmer_groups,id',
            'nik' => 'required|string|size:16|unique:farmers',
            'province_id' => 'nullable|string|max:2', 
            'city_id' => 'nullable|string|max:4',
            'district_id' => 'nullable|string|max:7',
            'village_id' => 'nullable|string|max:10',
            'notes' => 'nullable|string',
            
            // Validasi Array Lahan
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
            
            // Validasi file berkas fisik
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
            // 1. Buat data user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            $user->assignRole('petani');

            $totalLandArea = collect($request->lands)->sum(function ($land) {
                return $land['area'] ?? 0;
            });

            // 2. Buat profil utama petani
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

            // 3. Ambil seluruh file dari request lands
            $allLandFiles = $request->file('lands');

            // 4. Simpan data lahan beserta pemrosesan file berkas fisik
            foreach ($request->lands as $index => $landData) {
                $documentPath = null;

                if (isset($allLandFiles[$index]['ownership_document'])) {
                    $file = $allLandFiles[$index]['ownership_document'];
                    $path = $file->store('ownership_documents', 'public');
                    $documentPath = Storage::url($path); 
                }

                $farmer->lands()->create([
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
                ]);
            }

            DB::commit();
 
            return response()->json([
                'success' => true,
                'message' => 'Data master petani berhasil didaftarkan!',
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
        $farmer = Farmer::with(['user', 'farmer_group', 'lands.plants', 'village'])->find($id);

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
                $existingLand = null;
                if (isset($landData['id'])) {
                    $existingLand = Land::find($landData['id']);
                }

                // Logika Dokumen Kepemilikan
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

                $land = $farmer->lands()->updateOrCreate(
                    ['id' => $landData['id'] ?? null],
                    [
                        'land_name' => $landData['land_name'],
                        
                        'province_id' => (!empty($landData['province_id'])) ? $landData['province_id'] : ($existingLand ? $existingLand->province_id : null),
                        'city_id'     => (!empty($landData['city_id']))     ? $landData['city_id']     : ($existingLand ? $existingLand->city_id : null),
                        'district_id' => (!empty($landData['district_id'])) ? $landData['district_id'] : ($existingLand ? $existingLand->district_id : null),
                        'village_id'  => (!empty($landData['village_id']))  ? $landData['village_id']  : ($existingLand ? $existingLand->village_id : null),
                        
                        'area'        => $landData['area'],
                        'unit'        => $landData['unit'],
                        'status'      => $landData['status'],
                        
                        'current_use'     => (!empty($landData['current_use']))     ? $landData['current_use']     : ($existingLand ? $existingLand->current_use : null),
                        'soil_type'       => (!empty($landData['soil_type']))       ? $landData['soil_type']       : ($existingLand ? $existingLand->soil_type : null),
                        'water_source'    => (!empty($landData['water_source']))    ? $landData['water_source']    : ($existingLand ? $existingLand->water_source : null),
                        'irrigation_type' => (!empty($landData['irrigation_type'])) ? $landData['irrigation_type'] : ($existingLand ? $existingLand->irrigation_type : null),
                        
                        'ownership_document' => $documentPath, 
                        'location_address'   => (!empty($landData['location_address'])) ? $landData['location_address'] : ($existingLand ? $existingLand->location_address : null),
                        
                        'polygon_coordinates'           => (!empty($landData['polygon_coordinates']))           ? $landData['polygon_coordinates']           : ($existingLand ? $existingLand->polygon_coordinates : null), 
                        'center_latitude'               => (!empty($landData['center_latitude']))               ? $landData['center_latitude']               : ($existingLand ? $existingLand->center_latitude : null),
                        'center_longitude'              => (!empty($landData['center_longitude']))              ? $landData['center_longitude']              : ($existingLand ? $existingLand->center_longitude : null),
                        'average_temperature'           => (!empty($landData['average_temperature']))           ? $landData['average_temperature']           : ($existingLand ? $existingLand->average_temperature : null),
                        'average_humidity'              => (!empty($landData['average_humidity']))              ? $landData['average_humidity']              : ($existingLand ? $existingLand->average_humidity : null),
                        'average_monthly_precipitation' => (!empty($landData['average_monthly_precipitation'])) ? $landData['average_monthly_precipitation'] : ($existingLand ? $existingLand->average_monthly_precipitation : null),
                    ]
                );
                
                $keepLandIds[] = $land->id;
            }

            $deletedLands = $farmer->lands()->whereNotIn('id', $keepLandIds)->get();
            foreach ($deletedLands as $dLand) {
                if ($dLand->ownership_document) {
                    $oldPath = str_replace('/storage/', '', $dLand->ownership_document);
                    Storage::disk('public')->delete($oldPath);
                }
                $dLand->delete();
            }

            $totalLandArea = collect($request->lands)->sum('area');

            // 🌟 PERBAIKAN: Gunakan fallback dari data DB lama agar data wilayah profil utama petani tidak terhapus
            $farmer->update([
                'farmer_group_id' => $request->farmer_group_id,
                'nik'             => $request->nik,
                'province_id'     => (!empty($request->province_id)) ? $request->province_id : $farmer->province_id,
                'city_id'         => (!empty($request->city_id))     ? $request->city_id     : $farmer->city_id,
                'district_id'     => (!empty($request->district_id)) ? $request->district_id : $farmer->district_id,
                'village_id'      => (!empty($request->village_id))  ? $request->village_id  : $farmer->village_id,
                'total_land_area' => $totalLandArea,
                'notes'           => (!empty($request->notes))       ? $request->notes       : $farmer->notes,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data profil petani dan hasil mapping lahan berhasil diperbarui!',
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
}