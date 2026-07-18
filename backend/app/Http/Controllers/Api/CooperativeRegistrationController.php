<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cooperative;
use App\Models\User;
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
        'cooperative_name'         => 'required|string|max:255',
        'cooperative_code'         => 'required|string|max:50|unique:cooperatives,cooperative_code',
        'nib_cooperative'          => 'required|string|size:13|unique:cooperatives,nib_cooperative',
        'npwp'                     => 'required|string|max:25',
        'legal_approval_document'  => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        'legal_approval_number'    => 'required|string|max:100',
        'established_date'         => 'required|date',
        'address_cooperative'      => 'required|string',
        'email_cooperative'        => 'required|email',
        'phone_cooperative'        => 'required|string',
        'province'                 => 'required|string',
        'city_koor'                => 'required|string',
        'district'                 => 'required|string',
        'village'                  => 'required|string',
        'postal_code'              => 'required|string',
        'capacity_ton'             => 'required|numeric',
        'password'                 => 'required|string|min:8',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 422);
    }

    DB::beginTransaction();

    // Simpan path file di luar try block dulu (null) supaya bisa dicek
    // di catch untuk keperluan cleanup jika transaksi gagal
    $documentPath = null;

    try {
        // File disimpan duluan sebelum insert DB, supaya kalau upload
        // gagal, kita belum sempat bikin record DB yang nanggung
        $documentPath = $request->file('legal_approval_document')
            ->store('cooperatives/legal-documents', 'public');

        $cooperative = Cooperative::create([
            'name'                    => $request->cooperative_name,
            'cooperative_code'        => $request->cooperative_code,
            'nib_cooperative'         => $request->nib_cooperative,
            'npwp'                    => $request->npwp,
            'legal_approval_document' => $documentPath,
            'legal_approval_number'   => $request->legal_approval_number,
            'established_date'        => $request->established_date,
            'address'                 => $request->address_cooperative,
            'email_cooperative'       => $request->email_cooperative,
            'phone_cooperative'       => $request->phone_cooperative,
            'postal_code'             => $request->postal_code,
            'province'                => $request->province,
            'city_koor'               => $request->city_koor,
            'district'                => $request->district,
            'village'                 => $request->village,
            'warehouse_capacity_ton'  => $request->capacity_ton,
            'warehouse_surface_area'  => 0,
            'is_activated'            => false,
            'is_profile_completed'    => true,
        ]);

        $user = User::create([
            'name'           => $request->cooperative_name . ' Admin',
            'email'          => $request->email_cooperative,
            'password'       => Hash::make($request->password),
            'phone'          => $request->phone_cooperative,
            'cooperative_id' => $cooperative->id,
            'status'         => 'PENDING'
        ]);

        $user->assignRole('petugas-koperasi');

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran Koperasi sukses diajukan!'
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();

        // Cleanup: hapus file yang sudah terlanjur ke-upload
        // supaya tidak jadi file yatim di storage
        if ($documentPath) {
            \Storage::disk('public')->delete($documentPath);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal memproses pendaftaran.',
            'error'   => $e->getMessage()
        ], 500);
    }
}

    /**
     * 2. API DAFTAR ANTRIAN PENDING (Akses: Kemenko Pangan)
     */
    public function getPendingRegistrations()
{
    $pendingKoperasi = User::role('petugas-koperasi')
        ->where('status', 'PENDING')
        ->with('cooperative')
        ->get()
        ->map(function ($user) {
            if ($user->cooperative && $user->cooperative->legal_approval_document) {
                $user->cooperative->legal_approval_document_url =
                    \Storage::disk('public')->url($user->cooperative->legal_approval_document);
            }
            return $user;
        });

    return response()->json([
        'success' => true,
        'data' => $pendingKoperasi
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

    // Tambahkan method ini di dalam CooperativeRegistrationController

public function getActiveRegistrations()
{
    $activeRegistrations = User::role('petugas-koperasi') // 💡 Tambahkan filter role agar konsisten
        ->where('status', 'ACTIVE')
        ->with('cooperative') 
        ->latest()
        ->get()
        ->map(function ($user) { // 🆕 Tambahkan mapping url berkas berkas aktif
            if ($user->cooperative && $user->cooperative->legal_approval_document) {
                $user->cooperative->legal_approval_document_url =
                    \Storage::disk('public')->url($user->cooperative->legal_approval_document);
            }
            return $user;
        });

    return response()->json([
        'success' => true,
        'message' => 'Berhasil mengambil data koperasi aktif',
        'data' => $activeRegistrations
    ], 200);
}

/**
     * 5. API DETAIL PENDAFTARAN KOPERASI (Akses: Kemenko Pangan)
     */
    public function show($id)
    {
        // Cari data User beserta relasi Koperasi-nya
        $user = User::with('cooperative')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Data Koperasi tidak ditemukan.'
            ], 404);
        }

        // Generate Full URL untuk file dokumen agar langsung bisa di-download / dilihat di Frontend
        if ($user->cooperative && $user->cooperative->legal_approval_document) {
            $user->cooperative->legal_approval_document = \Storage::disk('public')->url($user->cooperative->legal_approval_document);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil detail pendaftaran',
            'data' => $user
        ], 200);
    }
}