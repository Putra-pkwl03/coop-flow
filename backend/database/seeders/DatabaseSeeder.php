<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Daftarkan seeder role dan user kita di sini
        $this->call([
            RoleAndUserSeeder::class,
            CooperativeSeeder::class,
            CooperativeRegistrationSeeder::class,
            UserCooperativeSeeder::class,
            FarmerGroupSeeder::class,
            FarmerSeeder::class,
            InventorySeeder::class,
            ProcurementOrderSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
