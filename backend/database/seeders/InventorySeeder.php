<?php

namespace Database\Seeders;

use App\Models\Cooperative;
use App\Models\Fertilizer;
use App\Models\InventoryMutation;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Gunakan updateOrCreate untuk Koperasi agar tidak duplikat
        $cooperativeActive = Cooperative::updateOrCreate(
            ['email_cooperative' => 'koperasi@coopflow.id'],
            [
                'name'                 => 'Koperasi Unit Desa (KUD) Makmur Sejahtera',
                'cooperative_code'     => 'KOP-DEFAULT-001',
                'nib_cooperative'      => '1234567890',
                'phone_cooperative'    => '081234567891',
                'address'              => 'SIDOMULYO RT 05',
                'province'             => 'DAERAH ISTIMEWA YOGYAKARTA',
                'city_koor'            => 'KABUPATEN SLEMAN',
                'district'             => 'GODEAN',
                'village'              => 'SIDOMULYO',
                'is_activated'         => true,
                'is_profile_completed' => true,
                'latitude'             => -6.11234500,
                'longitude'            => 106.23456700,
                'warehouse_capacity_ton' => 150
            ]
        );

        $dataPupuk = [
            ['fertilizer_code' => 'FPK-UREA', 'name' => 'Urea', 'current_stock_kg' => 45250, 'minimum_stock_kg' => 20000, 'price_per_kg' => 2500, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-NPK', 'name' => 'NPK', 'current_stock_kg' => 38400, 'minimum_stock_kg' => 15000, 'price_per_kg' => 3000, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-ORGANIK', 'name' => 'Pupuk Organik', 'current_stock_kg' => 12800, 'minimum_stock_kg' => 10000, 'price_per_kg' => 1500, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-SP36', 'name' => 'SP-36', 'current_stock_kg' => 8500, 'minimum_stock_kg' => 5000, 'price_per_kg' => 2800, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-KCL', 'name' => 'KCl', 'current_stock_kg' => 7000, 'minimum_stock_kg' => 5000, 'price_per_kg' => 4000, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-DOLOMIT', 'name' => 'Dolomit', 'current_stock_kg' => 5500, 'minimum_stock_kg' => 5000, 'price_per_kg' => 1000, 'status' => 'tersedia'],
            ['fertilizer_code' => 'FPK-ZA', 'name' => 'ZA', 'current_stock_kg' => 7000, 'minimum_stock_kg' => 10000, 'price_per_kg' => 2200, 'status' => 'menipis'],
        ];

        foreach ($dataPupuk as $item) {
            // Gabungkan cooperative_id ke dalam array data
            $item['cooperative_id'] = $cooperativeActive->id;

            // 2. Gunakan updateOrCreate untuk Pupuk berdasarkan kode unik
            $fertilizer = Fertilizer::updateOrCreate(
                ['fertilizer_code' => $item['fertilizer_code']],
                $item
            );

            // 3. Hanya buat mutasi jika data baru (opsional: atau gunakan firstOrCreate)
            InventoryMutation::firstOrCreate(
                [
                    'fertilizer_id' => $fertilizer->id,
                    'description'   => 'Pasokan awal kuota subsidi dari gudang lini III PT Pupuk Indonesia'
                ],
                [
                    'type'        => 'masuk',
                    'quantity_kg' => $item['current_stock_kg'],
                    'created_at'  => now()->subDays(rand(1, 5))
                ]
            );
        }
    }
}