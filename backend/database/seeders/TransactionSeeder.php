<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Farmer;
use App\Models\Fertilizer;
use App\Models\Cooperative;
use App\Models\InventoryMutation;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str; // Import Str
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Bersihkan tabel transaksi terlebih dahulu (mencegah duplikasi)
        Schema::disableForeignKeyConstraints();
        TransactionItem::truncate();
        Transaction::truncate();
        Schema::enableForeignKeyConstraints();

        // 2. Ambil Koperasi Default (Godean) dari database
        $coopDefault = Cooperative::where('cooperative_code', 'KOP-DEFAULT-001')->first() 
            ?? Cooperative::first();

        if (!$coopDefault) {
            $this->command->error('Data Koperasi tidak ditemukan. Jalankan CooperativeSeeder terlebih dahulu!');
            return;
        }

        // 3. Distribusi Utama untuk Koperasi Default (Godean) - Jan - Jul
        $defaultMonthlyDistributions = [
            6 => 1200, // Jan
            5 => 2500, // Feb
            4 => 1800, // Mar
            3 => 3100, // Apr
            2 => 2200, // Mei
            1 => 4000, // Jun
            0 => 1500, // Jul (Bulan ini)
        ];

        $this->seedTransactionsForCooperative($coopDefault, $defaultMonthlyDistributions);

        // 4. Generate Distribusi untuk Koperasi Wilayah Lainnya (Depok, Tempel, dll)
        $otherCoops = Cooperative::where('id', '!=', $coopDefault->id)->get();

        foreach ($otherCoops as $coop) {
            $randomDistributions = [
                6 => rand(800, 1500),
                5 => rand(1500, 3000),
                4 => rand(1000, 2200),
                3 => rand(2000, 3500),
                2 => rand(1500, 2800),
                1 => rand(2500, 4200),
                0 => rand(1000, 2000),
            ];

            $this->seedTransactionsForCooperative($coop, $randomDistributions);
        }
    }

    /**
     * Helper function untuk memproses transaksi dan mutasi stok keluar per koperasi.
     */
    private function seedTransactionsForCooperative(Cooperative $cooperative, array $monthlyDistributions): void
    {
        // Ambil Petani yang terikat dengan Koperasi ini
        $farmers = Farmer::whereHas('user', function ($q) use ($cooperative) {
            $q->where('cooperative_id', $cooperative->id);
        })->get();

        // Fallback jika petani belum terikat spesifik
        if ($farmers->isEmpty()) {
            $farmers = Farmer::all();
        }

        $fertilizers = Fertilizer::where('cooperative_id', $cooperative->id)->get();

        if ($farmers->isEmpty() || $fertilizers->isEmpty()) {
            return;
        }

        foreach ($monthlyDistributions as $monthsAgo => $totalKg) {
            $baseDate = Carbon::now()->subMonths($monthsAgo)->startOfMonth();
            
            $numberOfTransactions = rand(3, 6);
            $kgPerTransaction = $totalKg / $numberOfTransactions;

            for ($i = 0; $i < $numberOfTransactions; $i++) {
                $farmer = $farmers->random(); 
                $selectedFertilizer = $fertilizers->random(); 

                // Variasikan jumlah Kg agar angkanya alami (+/- 20%)
                $actualKg = max(10, round($kgPerTransaction * (rand(80, 120) / 100)));
                
                // Gunakan harga asli dari tabel fertilizers
                $pricePerKg = $selectedFertilizer->price_per_kg ?? 2500;
                $subtotal = $actualKg * $pricePerKg;

                // Acak hari di bulan tersebut
                $transactionDate = (clone $baseDate)->addDays(rand(1, 28));
                $dateString = $transactionDate->format('ymd');

                // PERBAIKAN: Gunakan kombinasikan ID Koperasi, index loop, dan karakter acak unik
                $uniqueSuffix = $cooperative->id . $i . strtoupper(Str::random(4));

                // 1. Buat Header Transaksi
                $transaction = Transaction::create([
                    'transaction_code' => 'GAF-' . $dateString . '-' . $uniqueSuffix,
                    'invoice_number'   => 'INV-' . $dateString . '-' . $uniqueSuffix,
                    'farmer_id'        => $farmer->id,
                    'grand_total'      => $subtotal,
                    'amount_paid'      => $subtotal,
                    'payment_method'   => 'Cash',
                    'status'           => 'success',
                    'created_at'       => $transactionDate,
                    'updated_at'       => $transactionDate,
                ]);

                // 2. Buat Item Transaksi
                TransactionItem::create([
                    'transaction_id'      => $transaction->id,
                    'fertilizer_id'       => $selectedFertilizer->id,
                    'actual_purchased_kg' => $actualKg,
                    'price_per_kg'        => $pricePerKg,
                    'subtotal'            => $subtotal,
                    'created_at'          => $transactionDate,
                    'updated_at'          => $transactionDate,
                ]);

                // 3. Catat Mutasi Stok Keluar (Inventory Mutation Audit Log)
                InventoryMutation::create([
                    'fertilizer_id' => $selectedFertilizer->id,
                    'type'          => 'keluar',
                    'quantity_kg'   => $actualKg,
                    'description'   => 'Penebusan pupuk subsidi oleh petani (' . ($farmer->full_name ?? 'Petani') . ')',
                    'created_at'    => $transactionDate,
                    'updated_at'    => $transactionDate,
                ]);
            }
        }
    }
}