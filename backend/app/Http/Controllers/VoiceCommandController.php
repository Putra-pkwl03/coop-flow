<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VoiceCommandController extends Controller
{
    public function processVoiceCommand(Request $request)
    {
        // 1. Validasi Input dari Frontend/Mobile
        $request->validate([
            'text' => 'required|string',
        ]);

        $userText = $request->input('text');

        // Mengambil URL FastAPI dari config/env (menggunakan FASTAPI_BASE_URL sesuai file .env)
        $fastApiUrl = config('services.fastapi.base_url', env('FASTAPI_BASE_URL', 'http://localhost:8000'));

        try {
            // 2. Kirim Request ke FastAPI /api/v1/intent
            $response = Http::timeout(5)->post("{$fastApiUrl}/api/v1/intent", [
                'text' => $userText,
            ]);

            if ($response->failed()) {
                Log::error("FastAPI Error Response: " . $response->body());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal terhubung ke ML Service Voice Intent',
                ], 500);
            }

            $result = $response->json();
            $intent = $result['intent'] ?? 'UNKNOWN';
            $confidence = $result['confidence'] ?? 0.0;

            // 3. Mapping Intent ke Route / Aksi di Laravel Frontend
            $action = $this->mapIntentToAction($intent);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'original_text' => $userText,
                    'intent' => $intent,
                    'confidence' => $confidence,
                    'action' => $action
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Voice Command Exception: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan pada server pembaca suara.',
            ], 500);
        }
    }

    /**
     * Memetakan Intent IndoBERT ke Navigasi/Aksi aplikasi
     */
    private function mapIntentToAction(string $intent): array
    {
        return match ($intent) {
            'NAVIGATE_LANDS' => [
                'type' => 'NAVIGATE',
                'target_route' => '/lands',
                'description' => 'Membuka halaman data lahan'
            ],
            'NAVIGATE_FERTILIZERS' => [
                'type' => 'NAVIGATE',
                'target_route' => '/fertilizers',
                'description' => 'Membuka halaman kuota & pupuk'
            ],
            'NAVIGATE_TRANSACTIONS' => [
                'type' => 'NAVIGATE',
                'target_route' => '/transactions',
                'description' => 'Membuka halaman riwayat transaksi'
            ],
            'NAVIGATE_FERTILIZER_HISTORY' => [
                'type' => 'NAVIGATE',
                'target_route' => '/fertilizers/history',
                'description' => 'Membuka riwayat pemupukan lahan'
            ],
            'NAVIGATE_HOME' => [
                'type' => 'NAVIGATE',
                'target_route' => '/dashboard',
                'description' => 'Kembali ke halaman utama'
            ],
            'SCROLL_DOWN' => [
                'type' => 'SCROLL',
                'direction' => 'DOWN',
                'amount' => 400
            ],
            'SCROLL_UP' => [
                'type' => 'SCROLL',
                'direction' => 'UP',
                'amount' => 400
            ],
            'SCROLL_TOP' => [
                'type' => 'SCROLL',
                'direction' => 'TOP'
            ],
            'SCROLL_BOTTOM' => [
                'type' => 'SCROLL',
                'direction' => 'BOTTOM'
            ],
            'STOP_LISTENING' => [
                'type' => 'CONTROL',
                'command' => 'STOP_MIC'
            ],
            default => [
                'type' => 'UNKNOWN',
                'description' => 'Perintah suara tidak dikenali'
            ],
        };
    }
}