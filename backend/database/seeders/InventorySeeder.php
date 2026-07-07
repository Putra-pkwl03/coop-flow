<?php

namespace Database\Seeders;

use App\Models\Cooperative;
use App\Models\Warehouse;
use App\Models\Fertilizer;
use App\Models\InventoryMutation;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Data Koperasi Induk
        $cooperative = Cooperative::create([
            'name' => 'Koperasi Merah Putih'
        ]);

        // 2. Buat Data Multi-Gudang
        $gudangPusat = Warehouse::create([
            'cooperative_id' => $cooperative->id,
            'name'           => 'Gudang Pusat Klaten',
            'capacity_kg'    => 100000 // 100 Ton
        ]);

        $gudangCabang = Warehouse::create([
            'cooperative_id' => $cooperative->id,
            'name'           => 'Gudang Cabang Sukamaju',
            'capacity_kg'    => 50000 // 50 Ton
        ]);

        // 3. Buat Data Master Pupuk & Saldo Stok Awal (Sesuai Gambar UI Frontend)
        $dataPupuk = [
            [
                'warehouse_id'       => $gudangPusat->id,
                'name'               => 'Urea',
                'current_stock_kg'   => 45250,
                'minimum_stock_kg'   => 20000,
                'price_per_kg'       => 2500, // Misal Rp 2.500/kg
            ],
            [
                'warehouse_id'       => $gudangPusat->id,
                'name'               => 'NPK',
                'current_stock_kg'   => 38400,
                'minimum_stock_kg'   => 15000,
                'price_per_kg'       => 3000,
            ],
            [
                'warehouse_id'       => $gudangPusat->id,
                'name'               => 'Pupuk Organik',
                'current_stock_kg'   => 12800,
                'minimum_stock_kg'   => 10000,
                'price_per_kg'       => 1500,
            ],
            [
                'warehouse_id'       => $gudangCabang->id,
                'name'               => 'SP-36',
                'current_stock_kg'   => 8500,
                'minimum_stock_kg'   => 5000,
                'price_per_kg'       => 2800,
            ],
            [
                'warehouse_id'       => $gudangCabang->id,
                'name'               => 'KCl',
                'current_stock_kg'   => 7000,
                'minimum_stock_kg'   => 5000,
                'price_per_kg'       => 4000,
            ],
            [
                'warehouse_id'       => $gudangCabang->id,
                'name'               => 'Dolomit',
                'current_stock_kg'   => 5500,
                'minimum_stock_kg'   => 5000,
                'price_per_kg'       => 1000,
            ],
            [
                'warehouse_id'       => $gudangCabang->id,
                'name'               => 'ZA',
                'current_stock_kg'   => 7000, // Di bawah minimal 10.000 agar memicu status Kritis
                'minimum_stock_kg'   => 10000,
                'price_per_kg'       => 2200,
            ],
        ];

        foreach ($dataPupuk as $item) {
            $fertilizer = Fertilizer::create($item);

            // 4. Berikan data histori awal (mutasi masuk) sebagai pemanis halaman riwayat stok
            InventoryMutation::create([
                'fertilizer_id' => $fertilizer->id,
                'type'          => 'masuk',
                'quantity_kg'   => $item['current_stock_kg'],
                'description'   => 'Pasokan awal kuota subsidi dari gudang lini III PT Pupuk Indonesia',
                'created_at'    => now()->subDays(rand(1, 5))
            ]);
        }
    }
}