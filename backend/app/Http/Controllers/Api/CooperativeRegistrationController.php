<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cooperative;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CooperativeRegistrationController extends Controller
{
    /**
     * 1. API REGISTRASI MANDIRI (Akses: Publik / Calon Koperasi)
     */
    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            // Validasi Koperasi
            'cooperative_name'   => 'required|string|max:255',
            'cooperative_code'   => 'required|string|max:50|unique:cooperatives,cooperative_code',
            'nik_cooperative'    => 'required|string|max:50|unique:cooperatives,nik_cooperative',
            'legal_entity_type'  => 'required|string',
            'legal_entity_number'=> 'required|string',
            'established_date'   => 'required|date',
            'npwp'               => 'nullable|string',
            'address_cooperative'=> 'required|string',
            'email_cooperative'  => 'required|email',
            'phone_cooperative'  => 'required|string',
            'province'           => 'required|string',
            'city_koor'          => 'required|string',
            'district'           => 'required|string',
            'village'            => 'required|string',
            'postal_code'        => 'required|string',

            // Validasi Gudang Awal
            'warehouse_name'     => 'required|string|max:255',
            'warehouse_address'  => 'required|string',
            'surface_area'       => 'required|numeric',
            'capacity_ton'       => 'required|integer',
            'warehouse_type'     => 'required|string',
            'facilities'         => 'nullable|array', 

            // Validasi Akun Pengurus / Login Utama
            'admin_name'         => 'required|string|max:255',
            'email'              => 'required|string|email|max:255|unique:users,email',
            'password'           => 'required|string|min:8',
            'phone'              => 'required|string|unique:users,phone',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Proteksi Data Integrity: Menggunakan DB Transaction
        DB::beginTransaction();

        try {
            // Simpan Identitas Induk Koperasi
            $cooperative = Cooperative::create([
                'name'                 => $request->cooperative_name,
                'cooperative_code'     => $request->cooperative_code,
                'nik_cooperative'      => $request->nik_cooperative,
                'legal_entity_type'    => $request->legal_entity_type,
                'legal_entity_number'  => $request->legal_entity_number,
                'established_date'     => $request->established_date,
                'npwp'                 => $request->npwp,
                'address'              => $request->address_cooperative,
                'email_cooperative'    => $request->email_cooperative,
                'phone_cooperative'    => $request->phone_cooperative,
                'postal_code'          => $request->postal_code,
                'province'             => $request->province,
                'city_koor'            => $request->city_koor,
                'district'             => $request->district,
                'village'              => $request->village,
                'is_activated'         => false,
                'is_profile_completed' => true,  
            ]);

            //  Simpan Data Gudang Awal Koperasi
            Warehouse::create([
                'cooperative_id' => $cooperative->id,
                'name'           => $request->warehouse_name,
                'address'        => $request->warehouse_address,
                'surface_area'   => $request->surface_area,
                'capacity_ton'   => $request->capacity_ton,
                'warehouse_type' => $request->warehouse_type,
                'facilities'     => $request->facilities,
            ]);

            // Simpan Akun Pengurus Utama (Status: PENDING)
            $user = User::create([
                'name'           => $request->admin_name,
                'email'          => $request->email,
                'password'       => Hash::make($request->password), 
                'phone'          => $request->phone,
                'cooperative_id' => $cooperative->id,
                'status'         => 'PENDING'
            ]);

            //  mencari role 'petugas-koperasi' di guard 'api'
            $role =\Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'petugas-koperasi',
                'guard_name' => 'api'
            ]);

            // Hubungkan dengan Role secara langsung
            $user->assignRole('petugas-koperasi');
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran Koperasi sukses diajukan! Menunggu verifikasi Kemenko Pangan.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pendaftaran data.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. API DAFTAR ANTRIAN PENDING (Akses: Kemenko Pangan)
     */
    public function getPendingRegistrations()
    {
        // Mengambil data user pending beserta relasi koperasi dan gudangnya
        $pendingData = User::where('status', 'PENDING')
            ->with(['cooperative.warehouses'])
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $pendingData
        ], 200);
    }

    /**
     * 3. API SETUJUI / AKTIFKAN KOPERASI (Akses: Kemenko Pangan)
     */
    public function approve($userId)
    {
        $user = User::with('cooperative')->find($userId);

        if (!$user) {
            return response()->json(['message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        DB::transaction(function () use ($user) {
            // Aktifkan User Admin
            $user->update(['status' => 'ACTIVE']);
            
            // Aktifkan Induk Koperasi terkait
            if ($user->cooperative) {
                $user->cooperative->update(['is_activated' => true]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun dan data induk Koperasi sukses diaktifkan!'
        ], 200);
    }

    /**
     * 4. API TOLAK PENDAFTARAN (Akses: Kemenko Pangan)
     */
    public function reject(Request $request, $userId)
    {
        $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Data pengajuan tidak ditemukan.'], 404);
        }

        $user->update([
            'status'           => 'REJECTED',
            'rejection_reason' => $request->rejection_reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan pendaftaran Koperasi resmi ditolak.'
        ], 200);
    }
}