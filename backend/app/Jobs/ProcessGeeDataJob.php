<?php

namespace App\Jobs;

use App\Models\Land;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessGeeDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    protected $land;

    public function __construct(Land $land)
    {
        $this->land = $land;
    }

    public function handle(): void
    {
        $baseUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', 'http://ml-engine:8000'));
        
        // 1. Decode JSON string koordinat dari database
        $rawCoords = is_string($this->land->polygon_coordinates) 
            ? json_decode($this->land->polygon_coordinates, true) 
            : $this->land->polygon_coordinates;

        if (empty($rawCoords) || !is_array($rawCoords) || count($rawCoords) < 3) {
            Log::warning("GEE PROCESS SKIPPED: Missing or invalid Coords for Land ID {$this->land->id}");
            return;
        }

        // 2. Format & validasi koordinat ke standar GeoJSON [Longitude, Latitude]
        $fixedCoords = [];
        foreach ($rawCoords as $pt) {
            $val1 = (float) $pt[0];
            $val2 = (float) $pt[1];

            // Jika angka pertama adalah Latitude (di Indonesia: -11 s/d 6), balik jadi [Lon, Lat]
            if ($val1 < 10 && $val2 > 90) {
                $fixedCoords[] = [$val2, $val1]; 
            } else {
                // Jika sudah [Lon, Lat] (Longitude > 90), biarkan tetap
                $fixedCoords[] = [$val1, $val2];
            }
        }

        // 3. Pastikan poligon tertutup (titik akhir = titik awal)
        if ($fixedCoords[0] !== end($fixedCoords)) {
            $fixedCoords[] = $fixedCoords[0];
        }

        try {
            // Kirim koordinat ke FastAPI Python
            $response = Http::timeout(60)->post("{$baseUrl}/api/v1/analyze-land", [
                'coordinates' => $fixedCoords,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info("GEE RESPONSE DATA [Land #{$this->land->id}]:", $responseData);

                $geeResult = $responseData['data'] ?? [];
                $ndvi = $geeResult['ndvi'] ?? null;

                // Refresh model untuk memastikan instance terbaru, lalu update NDVI
                $this->land->fresh()->update([
                    'current_ndvi' => $ndvi,
                ]);

                Log::info("GEE ANALYZE SUCCESS [Land #{$this->land->id}]: Updated NDVI = " . json_encode($ndvi));
            } else {
                Log::error("GEE ANALYZE FAILED [Land #{$this->land->id}]: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error("GEE ANALYZE EXCEPTION [Land #{$this->land->id}]: " . $e->getMessage());
            throw $e;
        }
    }
}