<?php

namespace Database\Seeders;

use App\Models\Cooperative;
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
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $roleAdminLapangan    = Role::firstOrCreate(['name' => 'admin-lapangan', 'guard_name' => 'api']);
        $rolePetugasKoperasi  = Role::firstOrCreate(['name' => 'petugas-koperasi', 'guard_name' => 'api']);
        $roleDinasPertanian   = Role::firstOrCreate(['name' => 'dinas-pertanian', 'guard_name' => 'api']);
        $roleKemenkoPangan    = Role::firstOrCreate(['name' => 'kemenko-pangan', 'guard_name' => 'api']);
        $rolePetani           = Role::firstOrCreate(['name' => 'petani', 'guard_name' => 'api']);

        // --- KOPERASI  ---
        $koperasi = Cooperative::firstOrCreate(
            ['email_cooperative' => 'koperasi@coopflow.id'],
            [
                'name' => 'Koperasi Unit Desa (KUD) Makmur Sejahtera',
                'cooperative_code' => 'KOP-DEFAULT-001',
                'nib_cooperative' => '1234567890',
                'phone_cooperative' => '081234567891',
                'address' => 'SIDOMULYO RT 05',
                'province' => 'DAERAH ISTIMEWA YOGYAKARTA',
                'city_koor' => 'KABUPATEN SLEMAN',
                'district' => 'GODEAN',
                'village' => 'SIDOMULYO',
                'is_activated' => true,
                'is_profile_completed' => true,
            ]
        );

        // --- Akun Admin Lapangan (Terikat Koperasi) ---
        $adminLapangan = User::firstOrCreate(
            ['email' => 'admin.lapangan@coopflow.id'],
            [
                'name' => 'Budi Setiawan (Admin Lapangan)',
                'password' => Hash::make('password123'),
                'phone' => '081234567890',
                'address' => 'Kantor Poktan Sleman, Yogyakarta',
                'cooperative_id' => $koperasi->id,
                'province_code' => 'DAERAH ISTIMEWA YOGYAKARTA',
                'city_code' => 'KABUPATEN SLEMAN',
                'district_code' => 'GODEAN',
                'village_code' => 'SIDOMULYO',
            ]
        );
        if (!$adminLapangan->hasRole($roleAdminLapangan)) {
            $adminLapangan->assignRole($roleAdminLapangan);
        }

        // ---  Akun Petugas Koperasi ---
        $petugasKoperasi = User::firstOrCreate(
            ['email' => 'koperasi@coopflow.id'],
            [
                'name' => 'Siti Aminah (Petugas Koperasi)',
                'password' => Hash::make('password123'),
                'phone' => '081234567891',
                'address' => 'SIDOMULYO RT 05',
                'province_code' => 'DAERAH ISTIMEWA YOGYAKARTA',
                'city_code' => 'KABUPATEN SLEMAN',
                'district_code' => 'GODEAN',
                'village_code' => 'SIDOMULYO',
                'cooperative_id' => $koperasi->id,
                'status' => 'ACTIVE',
                'email_verified_at' => now(),
            ]
        );
        if (!$petugasKoperasi->hasRole($rolePetugasKoperasi)) {
            $petugasKoperasi->assignRole($rolePetugasKoperasi);
        }

        // ---  Akun Dinas Pertanian ---
        $dinasPertanian = User::firstOrCreate(
            ['email' => 'dinas.pertanian@go.id'],
            [
                'name' => 'Ir. Ahmad Subarjo (Dinas Pertanian)',
                'password' => Hash::make('password123'),
                'phone' => '081234567892',
                'address' => 'Kantor Dinas Pertanian & Ketahanan Pangan Daerah',
                'cooperative_id' => null,
                'province_code' => 'DAERAH ISTIMEWA YOGYAKARTA',
                'city_code' => 'KABUPATEN SLEMAN',
                'district_code' => 'GODEAN',
                'village_code' => 'SIDOMULYO',
            ]
        );
        if (!$dinasPertanian->hasRole($roleDinasPertanian)) {
            $dinasPertanian->assignRole($roleDinasPertanian);
        }

        // ---  Akun Kemenko Pangan ---
        $kemenkoPangan = User::firstOrCreate(
            ['email' => 'kemenko.pangan@go.id'],
            [
                'name' => 'Dr. Hendra Wijaya (Kemenko Pangan)',
                'password' => Hash::make('password123'),
                'phone' => '081234567893',
                'address' => 'Kementerian Koordinator Bidang Pangan, Jakarta',
                'cooperative_id' => null
            ]
        );
        if (!$kemenkoPangan->hasRole($roleKemenkoPangan)) {
            $kemenkoPangan->assignRole($roleKemenkoPangan);
        }
    }
}