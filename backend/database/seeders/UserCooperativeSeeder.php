<?php

namespace Database\Seeders;

use App\Models\Cooperative;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserCooperativeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Membuat 1 akun user "petugas-koperasi" untuk SETIAP koperasi
     * yang sudah ada di tabel cooperatives (hasil CooperativeSeeder).
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $rolePetugasKoperasi = Role::firstOrCreate([
            'name'       => 'petugas-koperasi',
            'guard_name' => 'api',
        ]);

        $cooperatives = Cooperative::all();

        foreach ($cooperatives as $coop) {
            $generatedPhone = '0851' . str_pad((string) $coop->id, 8, '0', STR_PAD_LEFT);

            $petugas = User::firstOrCreate(
                ['email' => $coop->email_cooperative],
                [
                    'name'               => 'Petugas ' . $coop->name,
                    'password'           => Hash::make('password123'),
                    'phone'              => $generatedPhone,
                    'address'            => $coop->address,
                    'cooperative_id'     => $coop->id,
                    'province_code'      => $coop->province,
                    'city_code'          => $coop->city_koor,
                    'district_code'      => $coop->district,
                    'village_code'       => $coop->village,
                    'status'             => 'ACTIVE',
                    'email_verified_at'  => now(),
                ]
            );

            if (!$petugas->hasRole($rolePetugasKoperasi)) {
                $petugas->assignRole($rolePetugasKoperasi);
            }

            $this->command->info("Petugas koperasi dibuat/ditemukan untuk: {$coop->name} ({$petugas->email})");
        }
    }
}