<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Farmer;
use App\Models\Land;
use App\Models\Plant;
use App\Models\FarmerGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FarmerSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Bersihkan tabel anak terlebih dahulu untuk menghindari constraint violation
        Schema::disableForeignKeyConstraints();
        Plant::truncate();
        Land::truncate();
        Farmer::truncate();
        FarmerGroup::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Buat data Kelompok Tani (Farmer Groups)
        $group1 = FarmerGroup::create([
            'name' => 'Kelompok Tani Makmur Sentosa',
            'description' => 'Kelompok tani utama untuk komoditas padi dan palawija daerah barat.',
        ]);

        $group2 = FarmerGroup::create([
            'name' => 'Kelompok Tani Tani Mukti',
            'description' => 'Kelompok tani fokus hortikultura sayuran dan buah organik.',
        ]);


        // ----------------------------------------------------
        // PETANI 1: Bapak Fikri (Memiliki 2 Lahan, Lahan 1 berisi 2 Jenis Tanaman)
        // ----------------------------------------------------
        $user1 = User::updateOrCreate(
            ['email' => 'fikri@email.com'], // Unik berdasarkan email
            [
                'name' => 'Bapak Fikri',
                'password' => Hash::make('password123'),
                'phone' => '081234567898',
                'address' => 'Desa Makmur Jaya RT 01/RW 02',
            ]
        );
        $user1->assignRole('petani');

        $farmer1 = Farmer::create([
            'user_id' => $user1->id,
            'farmer_group_id' => $group1->id, 
            'nik' => '3301011212800001',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'total_land_area' => 3.50,
            'notes' => 'Petani padi senior dengan metode tumpang sari.',
        ]);

        // Lahan 1 milik Bapak Fikri (Tumpang Sari - Padi & Jagung)
        $land1 = $farmer1->lands()->create([
            'land_name' => 'Sawah Lor (Tumpang Sari)',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 2.00,
            'unit' => 'Hektar(Ha)',
            'status' => 'Milik Sendiri',
            'soil_type' => 'Aluvial',
            'water_source' => 'Irigasi Teknis',
            'irrigation_type' => 'Gravitasi',
            'average_temperature' => 28.5,
            'average_humidity' => 78,
            'average_monthly_precipitation' => 180.00,
        ]);

        $land1->plants()->create([
            'name' => 'Padi Ciherang',
            'planting_date' => '2026-05-10',
            'current_phase' => 'Generatif',
            'last_fertilizer_type' => 'NPK',
            'last_fertilizer_amount' => 120.00,
            'last_phase' => 'Vegetatif',
        ]);

        $land1->plants()->create([
            'name' => 'Jagung Manis',
            'planting_date' => '2026-05-25',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'Urea',
            'last_fertilizer_amount' => 80.00,
            'last_phase' => 'Penyemaian',
        ]);

        // Lahan 2 milik Bapak Fikri
        $land2 = $farmer1->lands()->create([
            'land_name' => 'Tegal Kidul',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 1.50,
            'unit' => 'Hektar(Ha)',
            'status' => 'Milik Sendiri',
            'soil_type' => 'Latosol',
            'water_source' => 'Tadah Hujan',
            'irrigation_type' => 'Manual',
            'average_temperature' => 29.0,
            'average_humidity' => 75,
            'average_monthly_precipitation' => 120.00,
        ]);

        $land2->plants()->create([
            'name' => 'Singkong Mentega',
            'planting_date' => '2026-02-15',
            'current_phase' => 'Generatif',
            'last_fertilizer_type' => 'Organik',
            'last_fertilizer_amount' => 200.00,
            'last_phase' => 'Vegetatif',
        ]);


        // ----------------------------------------------------
        // PETANI 2: Ibu Febiyanti (Memiliki 2 Lahan, Masing-Masing 1 Tanaman)
        // ----------------------------------------------------
        $user2 = User::updateOrCreate(
            ['email' => 'febiyanti@email.com'],
            [
                'name' => 'Ibu Febiyanti',
                'password' => Hash::make('password123'),
                'phone' => '082345678901',
                'address' => 'Dusun Harapan Baru RT 04/RW 01',
            ]
        );
        $user2->assignRole('petani');

        $farmer2 = Farmer::create([
            'user_id' => $user2->id,
            'farmer_group_id' => $group1->id,
            'nik' => '3301015505850002',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'total_land_area' => 1.25, 
            'notes' => 'Petani hortikultura cabai dan bawang.',
        ]);

        $land3 = $farmer2->lands()->create([
            'land_name' => 'Kebun Bawang',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 0.75,
            'unit' => 'Hektar(Ha)',
            'status' => 'Bagi Hasil',
            'soil_type' => 'Andosol',
            'water_source' => 'Sumur Bor',
            'irrigation_type' => 'Sprinkler',
            'average_temperature' => 26.0,
            'average_humidity' => 82,
            'average_monthly_precipitation' => 200.00,
        ]);

        $land3->plants()->create([
            'name' => 'Bawang Merah',
            'planting_date' => '2026-06-01',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'NPK',
            'last_fertilizer_amount' => 50.00,
            'last_phase' => 'Penyemaian',
        ]);

        $land4 = $farmer2->lands()->create([
            'land_name' => 'Kebun Cabai Belakang',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 0.50,
            'unit' => 'Hektar(Ha)',
            'status' => 'Sewa',
            'soil_type' => 'Andosol',
            'water_source' => 'Sumur Bor',
            'irrigation_type' => 'Drip',
            'average_temperature' => 26.5,
            'average_humidity' => 80,
            'average_monthly_precipitation' => 190.00,
        ]);

        $land4->plants()->create([
            'name' => 'Cabai Rawit Merah',
            'planting_date' => '2026-04-10',
            'current_phase' => 'Generatif',
            'last_fertilizer_type' => 'SP36',
            'last_fertilizer_amount' => 35.00,
            'last_phase' => 'Vegetatif',
        ]);


        // ----------------------------------------------------
        // PETANI 3: Bapak Ari (1 Lahan, 1 Tanaman)
        // ----------------------------------------------------
        $user3 = User::updateOrCreate(
            ['email' => 'ari@email.com'],
            [
                'name' => 'Bapak Ari',
                'password' => Hash::make('password123'),
                'phone' => '083456789012',
                'address' => 'Desa Sari RT 02/RW 03',
            ]
        );
        $user3->assignRole('petani');

        $farmer3 = Farmer::create([
            'user_id' => $user3->id,
            'farmer_group_id' => $group1->id,
            'nik' => '3301012106750003',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'total_land_area' => 1.00,
            'notes' => 'Petani padi reguler.',
        ]);

        $land5 = $farmer3->lands()->create([
            'land_name' => 'Sawah Utama Ari',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 1.00,
            'unit' => 'Hektar(Ha)',
            'status' => 'Milik Sendiri',
            'soil_type' => 'Aluvial',
            'water_source' => 'Irigasi Teknis',
            'irrigation_type' => 'Gravitasi',
            'average_temperature' => 28.0,
            'average_humidity' => 80,
            'average_monthly_precipitation' => 150.00,
        ]);

        $land5->plants()->create([
            'name' => 'Padi IR64',
            'planting_date' => '2026-06-15',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'NPK',
            'last_fertilizer_amount' => 60.00,
            'last_phase' => 'Penyemaian',
        ]);


        // ----------------------------------------------------
        // PETANI 4: Bapak Ivan (1 Lahan, 1 Tanaman)
        // ----------------------------------------------------
        $user4 = User::updateOrCreate(
            ['email' => 'ivan@email.com'],
            [
                'name' => 'Bapak Ivan',
                'password' => Hash::make('password123'),
                'phone' => '084567890123',
                'address' => 'Kp. Baru RT 01/RW 05',
            ]
        );
        $user4->assignRole('petani');

        $farmer4 = Farmer::create([
            'user_id' => $user4->id,
            'farmer_group_id' => $group2->id,
            'nik' => '3301011508880004',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'total_land_area' => 0.50,
            'notes' => 'Petani jagung pakan ternak.',
        ]);

        $land6 = $farmer4->lands()->create([
            'land_name' => 'Sawah Ivan',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 0.50,
            'unit' => 'Hektar(Ha)',
            'status' => 'Sewa',
            'soil_type' => 'Regosol',
            'water_source' => 'Tadah Hujan',
            'irrigation_type' => 'Manual',
            'average_temperature' => 30.0,
            'average_humidity' => 70,
            'average_monthly_precipitation' => 110.00,
        ]);

        $land6->plants()->create([
            'name' => 'Jagung Hibrida',
            'planting_date' => '2026-05-01',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'Urea',
            'last_fertilizer_amount' => 45.00,
            'last_phase' => 'Penyemaian',
        ]);


        // ----------------------------------------------------
        // PETANI 5: Ibu Brokline (1 Lahan, 1 Tanaman)
        // ----------------------------------------------------
        $user5 = User::updateOrCreate(
            ['email' => 'brokline@email.com'],
            [
                'name' => 'Ibu Brokline',
                'password' => Hash::make('password123'),
                'phone' => '085678901234',
                'address' => 'Dusun Bali RT 03/RW 04',
            ]
        );
        $user5->assignRole('petani');

        $farmer5 = Farmer::create([
            'user_id' => $user5->id,
            'farmer_group_id' => $group2->id,
            'nik' => '3301014402920005',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'total_land_area' => 1.20,
            'notes' => 'Petani tanaman organik ramah lingkungan.',
        ]);

        $land7 = $farmer5->lands()->create([
            'land_name' => 'Kebun Semangka Brokline',
            'province_id' => '33',
            'city_id' => '3301',
            'district_id' => '330101',
            'village_id' => '3301012001',
            'area' => 1.20,
            'unit' => 'Hektar(Ha)',
            'status' => 'Milik Sendiri',
            'soil_type' => 'Latosol',
            'water_source' => 'Aliran Sungai',
            'irrigation_type' => 'Gravitasi',
            'average_temperature' => 28.0,
            'average_humidity' => 75,
            'average_monthly_precipitation' => 140.00,
        ]);

        $land7->plants()->create([
            'name' => 'Semangka Merah Tanpa Biji',
            'planting_date' => '2026-06-10',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'Organik',
            'last_fertilizer_amount' => 150.00,
            'last_phase' => 'Penyemaian',
        ]);


        // ----------------------------------------------------
        // PETANI 6: Bapak Slamet (Sleman, DIY — untuk testing Dinas Pertanian Sleman)
        // ----------------------------------------------------
        $user6 = User::updateOrCreate(
            ['email' => 'slamet@email.com'],
            [
                'name' => 'Bapak Slamet',
                'password' => Hash::make('password123'),
                'phone' => '086789012345',
                'address' => 'Dusun Sidomulyo RT 02/RW 03, Godean, Sleman',
            ]
        );
        $user6->assignRole('petani');

        $farmer6 = Farmer::create([
            'user_id' => $user6->id,
            'farmer_group_id' => $group2->id,
            'nik' => '3404051205800006',
            'province_id' => '34',
            'city_id' => '3404',
            'district_id' => '340402',
            'village_id' => '3404022003', 
            'total_land_area' => 0.80,
            'notes' => 'Petani padi di wilayah Sleman untuk uji coba filter Dinas Pertanian.',
        ]);

        $land8 = $farmer6->lands()->create([
            'land_name' => 'Sawah Sidomulyo',
            'province_id' => '34',
            'city_id' => '3404',
            'district_id' => '340402',
            'village_id' => '3404022003', 
            'area' => 0.80,
            'unit' => 'Hektar(Ha)',
            'status' => 'Milik Sendiri',
            'soil_type' => 'Regosol',
            'water_source' => 'Irigasi Teknis',
            'irrigation_type' => 'Gravitasi',
            'average_temperature' => 27.0,
            'average_humidity' => 76,
            'average_monthly_precipitation' => 160.00,
        ]);

        $land8->plants()->create([
            'name' => 'Padi Mentik Wangi',
            'planting_date' => '2026-06-05',
            'current_phase' => 'Vegetatif',
            'last_fertilizer_type' => 'NPK',
            'last_fertilizer_amount' => 90.00,
            'last_phase' => 'Penyemaian',
        ]);
    }
}