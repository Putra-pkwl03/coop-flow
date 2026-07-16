<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FastApiService
{
    protected string $baseUrl = '';
    protected int $timeout = 30;

    public function __construct()
    {
        // Langsung baca dari config. Fallback default sudah di-handle dengan baik oleh config/services.php Anda.
        $this->baseUrl = config('services.fastapi.base_url');
        $this->timeout = (int) config('services.fastapi.timeout', 30);
    }

    public function predictProcurement(array $data): ?array
    {
        return $this->forecastStock($data);
    }

    /**
     * Mengirim data lahan ke FastAPI untuk prediksi kebutuhan pupuk
     */
    public function predictFertilizer(array $data): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders(['Accept' => 'application/json'])
                ->post("{$this->baseUrl}/predict/fertilizer", $data);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('FastAPI Fertilizer Prediction Failed: ' . $response->body());
            return null;

        } catch (Exception $e) {
            Log::error('FastAPI Connection Error (Fertilizer): ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Mengirim data stok ke FastAPI untuk peramalan stock-out/bullwhip
     */
    public function forecastStock(array $data): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders(['Accept' => 'application/json'])
                ->post("{$this->baseUrl}/forecast/stock", $data);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('FastAPI Stock Forecast Failed: ' . $response->body());
            return null;

        } catch (Exception $e) {
            Log::error('FastAPI Connection Error (Forecast): ' . $e->getMessage());
            return null;
        }
    }
}