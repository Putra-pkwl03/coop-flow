<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cooperative;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CooperativeController extends Controller
{
    /**
     * 1. MENAMPILKAN SEMUA KOPERASI (Akses: Kemenko Pangan / Dinas)
     * Bisa difilter berdasarkan status aktivasi via query string (?activated=false)
     */
    public function index(Request $request)
    {
        $query = Cooperative::query();

        // Filter berdasarkan status aktivasi jika ada parameter ?activated=true/false
        if ($request->has('activated')) {
            $isActivated = filter_var($request->activated, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_activated', $isActivated);
        }

        $cooperatives = $query->withCount('users')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data koperasi berhasil diambil.',
            'data'    => $cooperatives
        ], 200);
    }

    /**
     * 2. MEMBUAT DATA MASTER KOPERASI BARU (Akses: Kemenko Pangan)
     * Menambahkan data koperasi ke sistem pusat (belum aktif secara default)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required|string|max:255',
            'cooperative_code' => 'required|string|unique:cooperatives,cooperative_code|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cooperative = Cooperative::create([
            'name'             => $request->name,
            'cooperative_code' => $request->cooperative_code,
            'is_activated'     => false,
            'is_profile_completed' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data induk koperasi berhasil ditambahkan ke sistem pusat.',
            'data'    => $cooperative
        ], 201);
    }

    /**
     * 3. MENAMPILKAN DETAIL SATU KOPERASI
     */
    public function show($id)
    {
        $cooperative = Cooperative::with(['users'])->find($id);

        if (!$cooperative) {
            return response()->json([
                'success' => false,
                'message' => 'Koperasi tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail koperasi berhasil ditemukan.',
            'data'    => $cooperative
        ], 200);
    }

    /**
     * 4. AKTIVASI & GENERATE AKUN KOPERASI (Akses: Kemenko Pangan)
     * Mengubah status 'is_activated' menjadi true dan mengaktifkan akun login
     */
    public function activate(Request $request, $id)
    {
        $cooperative = Cooperative::find($id);

        if (!$cooperative) {
            return response()->json(['message' => 'Koperasi tidak ditemukan.'], 404);
        }

        if ($cooperative->is_activated) {
            return response()->json(['message' => 'Koperasi ini sudah aktif sebelumnya.'], 400);
        }

        // 1. Update status koperasi menjadi aktif
        $cooperative->update(['is_activated' => true]);

        // 2. Cek apakah sudah ada akun User yang terikat dengan koperasi ini
        // (Ini terjadi jika koperasi mendaftar mandiri lewat RegisterForm)
        $existingUser = User::where('cooperative_id', $cooperative->id)->first();

        if ($existingUser) {
            return response()->json([
                'success' => true,
                'message' => 'Koperasi berhasil diaktifkan! Silakan login menggunakan Email & Password yang telah didaftarkan sebelumnya.',
                'cooperative' => $cooperative
            ], 200);
        }

        // 3. Jika BELUM ada user (Kasus: Diinput manual oleh Kemenko via store)
        // Generate email & password default otomatis
        $defaultEmail = 'admin.' . Str::slug($cooperative->name) . '@kdmp.go.id';
        $defaultPassword = 'kdmp' . Str::lower($cooperative->cooperative_code);

        // Create user baru dengan role petugas-koperasi
        $user = User::create([
            'name'           => 'Admin ' . $cooperative->name,
            'email'          => $defaultEmail,
            'password'       => Hash::make($defaultPassword),
            'cooperative_id' => $cooperative->id
        ]);

        $user->assignRole('petugas-koperasi');

        return response()->json([
            'success' => true,
            'message' => 'Koperasi berhasil diaktifkan dan akun login default berhasil dibuat!',
            'credentials' => [
                'email'    => $defaultEmail,
                'password' => $defaultPassword, 
            ],
            'cooperative' => $cooperative
        ], 200);
    }

    /**
     * 5. UPDATE PROFIL / LENGKAPI DATA MANDIRI (Akses: Admin Koperasi)
     * Digunakan oleh admin koperasi sesaat setelah login pertama kali
     */
    public function updateProfile(Request $request)
    {
        // Kunci ID berdasarkan koperasi milik user yang sedang login saat ini (Secure)
        $cooperativeId = auth()->user()->cooperative_id;

        if (!$cooperativeId) {
            return response()->json(['message' => 'User Anda tidak terikat dengan koperasi mana pun.'], 403);
        }

        $cooperative = Cooperative::find($cooperativeId);

        $validator = Validator::make($request->all(), [
            'address'                => 'required|string',
            'latitude'               => 'required|numeric',
            'longitude'              => 'required|numeric',
            'warehouse_capacity_ton' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $cooperative->update([
            'address'                => $request->address,
            'latitude'               => $request->latitude,
            'longitude'              => $request->longitude,
            'warehouse_capacity_ton' => $request->warehouse_capacity_ton,
            'is_profile_completed'   => true // Profil resmi lengkap
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil dan data logistik koperasi berhasil diperbarui mandiri!',
            'data'    => $cooperative
        ], 200);
    }

    /**
     * 6. MENGHAPUS KOPERASI (Akses: Kemenko Pangan)
     */
    public function destroy($id)
    {
        $cooperative = Cooperative::find($id);

        if (!$cooperative) {
            return response()->json(['message' => 'Koperasi tidak ditemukan.'], 404);
        }

        $cooperative->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data koperasi berhasil dihapus dari sistem.'
        ], 200);
    }
}