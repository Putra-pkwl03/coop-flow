<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * API Registrasi Pengguna Baru
     */
    public function register(Request $request)
    {
        // 1. Validasi Input Data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|unique:users,phone',
            'address' => 'nullable|string',
            'role' => 'nullable|string|in:ketua-poktan,petani,dinas-pertanian,petugas-koperasi,admin-lapangan,kemenko-pangan',
            'cooperative_id' => 'required_if:role,petani,ketua-poktan|exists:cooperatives,id',
            
            // Validasi NIK (tanpa nullable agar required_if diproses saat role=petani)
            'nik' => 'required_if:role,petani|string|digits:16|unique:farmers,nik',

            // --- Validasi Kode Wilayah ---
            'province_code' => 'nullable|string|size:2',
            'city_code' => 'nullable|string|size:4',
            'district_code' => 'nullable|string|size:7',
            'village_code' => 'nullable|string|size:10',
        ], [
            'cooperative_id.required_if' => 'Petani atau Ketua Poktan wajib memilih Koperasi tempat Anda bernaung.',
            'nik.required_if' => 'NIK wajib diisi untuk pendaftaran Petani.',
            'nik.digits' => 'NIK harus berjumlah 16 digit.',
            'nik.unique' => 'NIK sudah terdaftar dalam sistem.'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $roleName = $request->role ?? 'petani';

        // Petani langsung ACTIVE, role lain default PENDING
        $status = ($roleName === 'petani') ? 'ACTIVE' : 'PENDING';

        DB::beginTransaction();
        try {
            // 2. Simpan Data User ke Database
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'status' => $status,
                'cooperative_id' => in_array($roleName, ['dinas-pertanian', 'kemenko-pangan']) ? null : $request->cooperative_id,
                
                'province_code' => $request->province_code,
                'city_code' => $request->city_code,
                'district_code' => $request->district_code,
                'village_code' => $request->village_code,
            ]);

            // 3. Simpan data detail Petani jika role-nya Petani
            if ($roleName === 'petani') {
                Farmer::create([
                    'user_id' => $user->id,
                    'nik' => $request->nik,
                    'province_id' => $request->province_code,
                    'city_id' => $request->city_code,
                    'district_id' => $request->district_code,
                    'village_id' => $request->village_code,
                ]);
            }

            // 4. Berikan Role Spatie
            $user->assignRole($roleName);

            DB::commit();

            // 5. Buat Token Akses Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registrasi berhasil!',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user->load(['roles', 'farmer', 'cooperative']) 
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal melakukan registrasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API Login Pengguna (Bisa menggunakan NIK atau Email)
     */
    public function login(Request $request)
    {
        $identifier = $request->input('login_identifier') ?? $request->input('email') ?? $request->input('nik');

        if (!$identifier) {
            return response()->json([
                'message' => 'Email atau NIK wajib diisi.'
            ], 422);
        }

        $request->validate([
            'password' => 'required|string',
        ]);

        $user = User::where('email', $identifier)
            ->orWhereHas('farmer', function ($query) use ($identifier) {
                $query->where('nik', $identifier);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email/NIK atau password salah.'
            ], 401);
        }

        if ($user->hasAnyRole(['petugas-koperasi', 'admin-lapangan'])) {
            if ($user->status === 'PENDING') {
                return response()->json([
                    'message' => 'Gagal masuk: Akun Koperasi Anda masih dalam proses verifikasi oleh Kemenko Pangan.'
                ], 403);
            }

            if ($user->status === 'REJECTED') {
                return response()->json([
                    'message' => 'Gagal masuk: Pendaftaran Koperasi ditolak. Alasan: ' . ($user->rejection_reason ?? 'Silakan hubungi Kemenko Pangan.')
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['roles', 'farmer', 'cooperative', 'province', 'city', 'district', 'village'])
        ]);
    }

    /**
     * API Logout Pengguna
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout, token telah dihapus.'
        ]);
    }

    /**
     * API Update Profil Pengguna yang Sedang Login (Generik untuk Semua Role)
     *
     * Hanya mengizinkan update: name, phone, email, password.
     * Field wilayah (province_code, city_code, district_code, village_code)
     * SENGAJA tidak disentuh di sini karena wilayah kerja/domisili bersifat
     * fixed dari admin dan tidak boleh diubah mandiri oleh user.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // 1. Validasi Input Data (partial update, pakai 'sometimes')
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'sometimes|required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $validated = $validator->validated();

        // 2. Isi hanya field yang memang dikirim
        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }
        if (array_key_exists('password', $validated)) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui!',
            'data' => $user->fresh()->load(['roles', 'farmer', 'cooperative']),
        ]);
    }
}