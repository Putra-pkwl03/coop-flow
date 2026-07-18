<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FieldAdminController extends Controller
{
    /**
     * 1. MENAMPILKAN SEMUA ADMIN LAPANGAN (Akses: Admin Koperasi)
     * Hanya menampilkan admin lapangan yang berada di koperasi yang sama dengan user login.
     */
    public function index()
    {
        $cooperativeId = auth()->user()->cooperative_id;

        if (!$cooperativeId) {
            return response()->json([
                'success' => false,
                'message' => 'User Anda tidak terikat dengan koperasi mana pun.'
            ], 403);
        }

        // Mengambil user dengan role 'admin-lapangan' khusus koperasi ini
        $fieldAdmins = User::role('admin-lapangan')
            ->where('cooperative_id', $cooperativeId)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar Admin Lapangan berhasil diambil.',
            'data'    => $fieldAdmins
        ], 200);
    }

    /**
     * 2. MENAMBAH ADMIN LAPANGAN BARU (Akses: Admin Koperasi)
     * Koperasi_id otomatis terisi berdasarkan koperasi si pembuat.
     */
    public function store(Request $request)
    {
        $cooperativeId = auth()->user()->cooperative_id;

        if (!$cooperativeId) {
            return response()->json([
                'success' => false,
                'message' => 'User Anda tidak terikat dengan koperasi mana pun.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
            'address'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        // Membuat akun baru dengan status langsung ACTIVE (karena diinput langsung oleh koperasi resmi)
        $user = User::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'phone'          => $request->phone,
            'address'        => $request->address,
            'cooperative_id' => $cooperativeId,
            'status'         => 'ACTIVE', 
        ]);

        // Memberikan role 'admin-lapangan' (Spatie)
        $user->assignRole('admin-lapangan');

        return response()->json([
            'success' => true,
            'message' => 'Admin Lapangan berhasil ditambahkan!',
            'data'    => $user
        ], 201);
    }

    /**
     * 3. DETAIL SATU ADMIN LAPANGAN (Akses: Admin Koperasi)
     * Mengamankan data agar koperasi lain tidak bisa mengintip lewat ID.
     */
    public function show($id)
    {
        $cooperativeId = auth()->user()->cooperative_id;

        $fieldAdmin = User::role('admin-lapangan')
            ->where('cooperative_id', $cooperativeId)
            ->where('id', $id)
            ->first();

        if (!$fieldAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Lapangan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $fieldAdmin
        ], 200);
    }

    /**
     * 4. EDIT DATA ADMIN LAPANGAN (Akses: Admin Koperasi)
     */
    public function update(Request $request, $id)
    {
        $cooperativeId = auth()->user()->cooperative_id;

        // Validasi kepemilikan data (Multi-Tenant lock)
        $fieldAdmin = User::role('admin-lapangan')
            ->where('cooperative_id', $cooperativeId)
            ->where('id', $id)
            ->first();

        if (!$fieldAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Lapangan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255',
            'email'   => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($fieldAdmin->id)],
            'phone'   => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($fieldAdmin->id)],
            'address' => 'nullable|string',
            'status'  => ['nullable', Rule::in(['ACTIVE', 'PENDING', 'REJECTED'])],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $dataToUpdate = [
            'name'    => $request->name,
            'email'   => $request->email,
            'phone'   => $request->phone,
            'address' => $request->address,
        ];

        // Jika form menginputkan password baru
        if ($request->filled('password')) {
            $dataToUpdate['password'] = Hash::make($request->password);
        }

        // Jika status ikut diubah
        if ($request->has('status')) {
            $dataToUpdate['status'] = $request->status;
        }

        $fieldAdmin->update($dataToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Data Admin Lapangan berhasil diperbarui!',
            'data'    => $fieldAdmin
        ], 200);
    }

    /**
     * 5. TOGGLE STATUS AKTIF / TIDAK AKTIF (Akses: Admin Koperasi)
     * Mengubah status antara ACTIVE (Aktif) dan PENDING (Non-aktif / Menunggu persetujuan)
     */
    public function toggleStatus($id)
    {
        $cooperativeId = auth()->user()->cooperative_id;

        $fieldAdmin = User::role('admin-lapangan')
            ->where('cooperative_id', $cooperativeId)
            ->where('id', $id)
            ->first();

        if (!$fieldAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Lapangan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        // Jika status saat ini ACTIVE, ubah jadi PENDING (Non-aktif). Begitupun sebaliknya.
        $newStatus = ($fieldAdmin->status === 'ACTIVE') ? 'PENDING' : 'ACTIVE';

        $fieldAdmin->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => 'Status Admin Lapangan berhasil diubah menjadi ' . $newStatus . '.',
            'data'    => $fieldAdmin
        ], 200);
    }

    /**
     * 6. HAPUS ADMIN LAPANGAN PERMANEN (Akses: Admin Koperasi)
     */
    public function destroy($id)
    {
        $cooperativeId = auth()->user()->cooperative_id;

        $fieldAdmin = User::role('admin-lapangan')
            ->where('cooperative_id', $cooperativeId)
            ->where('id', $id)
            ->first();

        if (!$fieldAdmin) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Lapangan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        $fieldAdmin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin Lapangan berhasil dihapus permanen.'
        ], 200);
    }
}