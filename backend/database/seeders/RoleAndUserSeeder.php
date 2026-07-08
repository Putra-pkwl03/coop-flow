<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Reset Cached Roles dan Permissions bawaan Spatie
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Buat Semua Role Sesuai Kebutuhan Proposal COOP-FLOW
        $roleAdminLapangan    = Role::create(['name' => 'admin-lapangan']);
        $rolePetugasKoperasi  = Role::create(['name' => 'petugas-koperasi']);
        $roleDinasPertanian   = Role::create(['name' => 'dinas-pertanian']);
        $roleKemenkoPangan    = Role::create(['name' => 'kemenko-pangan']);
        $rolePetani           = Role::create(['name' => 'petani']);

        // 3. Buat Akun Akun Contoh / Default untuk Masing-Masing Instansi

        // --- Akun Admin Lapangan ---
        $adminLapangan = User::create([
            'name' => 'Budi Setiawan (Admin Lapangan)',
            'email' => 'admin.lapangan@coopflow.id',
            'password' => Hash::make('password123'),
            'phone' => '081234567890',
            'address' => 'Kantor Poktan Sleman, Yogyakarta'
        ]);
        $adminLapangan->assignRole($roleAdminLapangan);

        // --- Akun Petugas Koperasi ---
        $petugasKoperasi = User::create([
            'name' => 'Siti Aminah (Petugas Koperasi)',
            'email' => 'koperasi@coopflow.id',
            'password' => Hash::make('password123'),
            'phone' => '081234567891',
            'address' => 'Koperasi Unit Desa (KUD) Makmur Sejahtera'
        ]);
        $petugasKoperasi->assignRole($rolePetugasKoperasi);

        // --- Akun Dinas Pertanian ---
        $dinasPertanian = User::create([
            'name' => 'Ir. Ahmad Subarjo (Dinas Pertanian)',ww
            'email' => 'dinas.pertanian@go.id',
            'password' => Hash::make('password123'),
            'phone' => '081234567892',
            'address' => 'Kantor Dinas Pertanian & Ketahanan Pangan Daerah'
        ]);
        $dinasPertanian->assignRole($roleDinasPertanian);

        // --- Akun Kemenko Pangan ---
        $kemenkoPangan = User::create([
            'name' => 'Dr. Hendra Wijaya (Kemenko Pangan)',
            'email' => 'kemenko.pangan@go.id',
            'password' => Hash::make('password123'),
            'phone' => '081234567893',
            'address' => 'Kementerian Koordinator Bidang Pangan, Jakarta'
        ]);
        $kemenkoPangan->assignRole($roleKemenkoPangan);
    }
}