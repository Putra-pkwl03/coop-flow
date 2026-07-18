<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|unique:users',
            'address' => 'nullable|string',
            'role' => 'nullable|string|in:ketua-poktan,petani,dinas-pertanian',
            'cooperative_id' => 'required_if:role,petani,ketua-poktan|exists:cooperatives,id'
        ], [
            'cooperative_id.required_if' => 'Petani atau Ketua Poktan wajib memilih Koperasi tempat Anda bernaung.'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 2. Simpan Data User ke Database dengan cooperative_id
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'cooperative_id' => $request->role === 'dinas-pertanian' ? null : $request->cooperative_id,
        ]);

        // 3. Berikan Role menggunakan Spatie Permission
        $roleName = $request->role ?? 'petani';
        $user->assignRole($roleName);

        // 4. Buat Token Akses Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('roles') 
        ], 201);
    }

    /**
     * API Login Pengguna
     */
    public function login(Request $request)
    {
        // 1. Validasi Input Login
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 2. Cari User Berdasarkan Email
        $user = User::where('email', $request->email)->first();

        // 3. Cek Ketersediaan User dan Kecocokan Password
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 401);
        }

        // ==========================================
        // 4. PENGECEKAN STATUS AKUN (BLOKIR AKSES)
        // ==========================================
        
        // Tolak jika status masih PENDING
        if ($user->status === 'PENDING') {
            return response()->json([
                'message' => 'Gagal masuk: Akun Koperasi Anda masih dalam proses verifikasi oleh Kemenko Pangan.'
            ], 403); // 403 Forbidden
        }

        // Tolak jika status REJECTED
        if ($user->status === 'REJECTED') {
            return response()->json([
                'message' => 'Gagal masuk: Pendaftaran Koperasi ditolak. Alasan: ' . ($user->rejection_reason ?? 'Silakan hubungi Kemenko Pangan.')
            ], 403); // 403 Forbidden
        }

        // ==========================================
        // Jika lolos (status ACTIVE atau role lain yang tidak butuh verifikasi)
        // ==========================================

        // 5. Buat Token Baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load(['roles', 'cooperative'])
        ]);
    }

    /**
     * API Logout Pengguna (Hapus Token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout, token telah dihapus.'
        ]);
    }
}