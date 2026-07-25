<?php

namespace App\Http\Controllers;

use App\Models\ProcurementOrder;
use App\Models\ProcurementOrderItem;
use App\Models\ProcurementOrderRevision;
use App\Models\InventoryMutation;
use App\Models\User;
use App\Mail\ProcurementSubmittedMail;
use App\Mail\ProcurementVerifiedMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProcurementOrderController extends Controller
{
    // Konstanta Kecepatan Moda Transportasi
    const TRUCK_SPEED_KMH = 45;      
    const VESSEL_SPEED_KMH = 18;      
    const MAX_DRIVING_HOURS_PER_DAY = 8;
    const DRIVER_REST_DURATION_HOURS = 9; 
    const PORT_BUFFER_HOURS = 6;      

    /**
     * 🟢 Status "logis" yang dianggap setara untuk kontrol akses/antrean.
     */
    const KEMENKO_QUEUE_STATUSES = ['PENDING_KEMENKO', 'PENDING_KEMENKO_ADJUSTED'];
    const APPROVED_STATUSES = ['APPROVED', 'APPROVED_ADJUSTED'];

    /**
     * MENAMPILKAN SEMUA DATA PO (INDEX)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = ProcurementOrder::with(['cooperative:id,name,province,city_koor']);

        if ($user->hasRole('petugas-koperasi') || isset($user->cooperative_id)) {
            $query->where('cooperative_id', $user->cooperative_id);
        } elseif ($user->hasRole('dinas-pertanian')) {
            $query->whereHas('cooperative', function ($q) use ($user) {
                $q->whereRaw('LOWER(city_koor) = ?', [strtolower($user->city_code)]);
            });
        } elseif ($user->hasRole('kemenko')) {
            $query->whereIn('status_verifikasi', array_merge(
                self::KEMENKO_QUEUE_STATUSES,
                self::APPROVED_STATUSES,
                ['REJECTED_KEMENKO']
            ));
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengadaan pupuk bersubsidi berhasil diambil.',
            'data' => $orders
        ], 200);
    }

    /**
     * MENAMPILKAN DETAIL DATA PO TERTENTU (SHOW)
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $order = ProcurementOrder::with([
            'cooperative', 
            'items.fertilizer',
            'revisions' => function ($q) {
                $q->with('revisedBy:id,name')->orderBy('created_at', 'desc');
            },
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen pengadaan (PO) tidak ditemukan.'
            ], 404);
        }

        if (($user->hasRole('petugas-koperasi') || isset($user->cooperative_id)) && $order->cooperative_id !== $user->cooperative_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak akses untuk melihat dokumen PO ini.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail dokumen pengadaan berhasil dimuat.',
            'data' => $order
        ], 200);
    }

  /**
     * STAGE 1: SUBMIT OLEH KOPERASI KDMP
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'periode_pengadaan' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.fertilizer_id' => 'required|exists:fertilizers,id',
            'items.*.fertilizer_name' => 'required|string',
            'items.*.final_bags_ordered' => 'required|integer|min:0',
            'items.*.packaging_size_kg' => 'required|integer',
            'items.*.price_per_kg' => 'required|numeric',
            'items.*.harga_per_karung' => 'required|numeric',
        ]);

        $user = $request->user();
        $cooperativeId = $user->cooperative_id;

        $filteredItems = array_filter($request->items, function ($item) {
            return $item['final_bags_ordered'] > 0;
        });

        if (empty($filteredItems)) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal memproses, minimal harus ada 1 pupuk dengan jumlah karung lebih dari 0.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $poNumber = 'PO-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));

            $order = ProcurementOrder::create([
                'cooperative_id' => $cooperativeId,
                'po_number' => $poNumber,
                'periode_pengadaan' => $request->periode_pengadaan,
                'status_verifikasi' => 'PENDING_DINAS', 
                'status_logistik' => 'NONE',
            ]);

            $totalBags = 0;
            $totalKg = 0;
            $totalCost = 0;
            $itemCount = 0;

            foreach ($request->items as $item) {
                if ($item['final_bags_ordered'] > 0) {
                    $itemWeight = $item['final_bags_ordered'] * $item['packaging_size_kg'];
                    $itemSubtotal = $item['final_bags_ordered'] * $item['harga_per_karung'];

                    ProcurementOrderItem::create([
                        'procurement_order_id' => $order->id,
                        'fertilizer_id' => $item['fertilizer_id'],
                        'fertilizer_name' => $item['fertilizer_name'],
                        'ai_suggested_bags' => $item['ai_suggested_bags'] ?? 0,
                        'ai_suggested_kg' => $item['ai_suggested_kg'] ?? 0,
                        'final_bags_ordered' => $item['final_bags_ordered'],
                        'final_weight_kg' => $itemWeight,
                        'packaging_size_kg' => $item['packaging_size_kg'],
                        'price_per_kg' => $item['price_per_kg'],
                        'harga_per_karung' => $item['harga_per_karung'],
                        'subtotal_price' => $itemSubtotal,
                    ]);

                    $totalBags += $item['final_bags_ordered'];
                    $totalKg += $itemWeight;
                    $totalCost += $itemSubtotal;
                    $itemCount++;

                    DB::table('ai_predictions')
                        ->where('cooperative_id', $cooperativeId)
                        ->where('fertilizer_id', $item['fertilizer_id'])
                        ->where('status_saran', 'DRAFT')
                        ->update([
                            'status_saran' => 'PROCESSED',
                            'updated_at' => now()
                        ]);
                } else {
                    DB::table('ai_predictions')
                        ->where('cooperative_id', $cooperativeId)
                        ->where('fertilizer_id', $item['fertilizer_id'])
                        ->where('status_saran', 'DRAFT')
                        ->update([
                            'status_saran' => 'SKIPPED', 
                            'updated_at' => now()
                        ]);
                }
            }

            $order->update([
                'total_items' => $itemCount,
                'total_bags_ordered' => $totalBags,
                'total_weight_kg' => $totalKg,
                'total_estimated_cost' => $totalCost,
            ]);

            DB::commit();

            // 📧 LOGIKA EMAIL: Kirim notifikasi ke Dinas Pertanian Kabupaten setempat
            $order->load('cooperative');
            $this->sendEmailToDinas($order);

            return response()->json([
                'success' => true, 
                'message' => 'Pengadaan pupuk berhasil diajukan ke Dinas Pertanian & Rekomendasi AI berhasil disinkronkan.', 
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan internal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * STAGE 2: VERIFIKASI OLEH DINAS PERTANIAN KABUPATEN
     */
    public function verifyByDinas(Request $request, $id): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:APPROVE,REJECT,ADJUST',
            'rejection_reason' => 'required_if:action,REJECT|string|nullable',
            'adjustment_reason' => 'required_if:action,ADJUST|string|nullable',
            'items' => 'required_if:action,ADJUST|array|min:1',
            'items.*.id' => 'required_if:action,ADJUST|integer|exists:procurement_order_items,id',
            'items.*.final_bags_ordered' => 'required_if:action,ADJUST|integer|min:0',
            'notes' => 'string|nullable'
        ]);

        $order = ProcurementOrder::with('cooperative')->findOrFail($id);

        if ($order->status_verifikasi !== 'PENDING_DINAS') {
            return response()->json(['success' => false, 'message' => 'Status dokumen tidak valid untuk verifikasi Dinas.'], 400);
        }

        if ($request->action === 'REJECT') {
            $order->update([
                'status_verifikasi' => 'REJECTED_DINAS',
                'rejection_reason' => $request->rejection_reason
            ]);

            // 📧 Kirim Email ke Koperasi
            $this->sendEmailToCooperative($order);

            return response()->json(['success' => true, 'message' => 'Dokumen pengadaan ditolak oleh Dinas Pertanian.']);
        }

        if ($request->action === 'ADJUST') {
            $response = $this->applyAdjustment(
                order: $order,
                request: $request,
                stage: 'DINAS',
                nextStatus: 'PENDING_KEMENKO_ADJUSTED',
                successMessage: 'Dinas Pertanian menyesuaikan jumlah pengadaan & meneruskannya ke Kemenko.'
            );

            // Refresh order agar status & item terbaru terbawa
            $order->refresh();

            // 📧 Kirim Email Berantai ke Koperasi DAN Kemenko
            $this->sendEmailToCooperative($order);
            $this->sendEmailToKemenko($order);

            return $response;
        }

        // Action APPROVE
        $order->update([
            'status_verifikasi' => 'PENDING_KEMENKO',
            'notes_from_verifier' => $request->notes
        ]);

        // 📧 Kirim Email Berantai ke Koperasi DAN Kemenko
        $this->sendEmailToCooperative($order);
        $this->sendEmailToKemenko($order);

        return response()->json(['success' => true, 'message' => 'Dokumen disetujui Dinas Pertanian & diteruskan ke Kemenko.']);
    }

    /**
     * STAGE 3A: PERSETUJUAN DOKUMEN / KUOTA OLEH KEMENKO
     */
    public function approveByKemenko(Request $request, $id): JsonResponse
    {
        $request->validate([
            'action' => 'required|in:APPROVE,REJECT,ADJUST',
            'rejection_reason' => 'required_if:action,REJECT|string|nullable',
            'adjustment_reason' => 'required_if:action,ADJUST|string|nullable',
            'items' => 'required_if:action,ADJUST|array|min:1',
            'items.*.id' => 'required_if:action,ADJUST|integer|exists:procurement_order_items,id',
            'items.*.final_bags_ordered' => 'required_if:action,ADJUST|integer|min:0',
            'notes' => 'string|nullable'
        ]);

        $order = ProcurementOrder::with('cooperative')->findOrFail($id);

        if (!in_array($order->status_verifikasi, self::KEMENKO_QUEUE_STATUSES)) {
            return response()->json(['success' => false, 'message' => 'Status dokumen tidak valid untuk verifikasi Kemenko.'], 400);
        }

        if ($request->action === 'REJECT') {
            $order->update([
                'status_verifikasi' => 'REJECTED_KEMENKO',
                'rejection_reason' => $request->rejection_reason
            ]);

            // 📧 Kirim Email ke Koperasi DAN Dinas
            $this->sendEmailToCooperative($order);
            $this->sendEmailToDinas($order);

            return response()->json(['success' => true, 'message' => 'Dokumen pengadaan resmi ditolak oleh Kemenko.']);
        }

        if ($request->action === 'ADJUST') {
            $response = $this->applyAdjustment(
                order: $order,
                request: $request,
                stage: 'KEMENKO',
                nextStatus: 'APPROVED_ADJUSTED',
                successMessage: 'Kemenko menyesuaikan alokasi kuota pengadaan. Nilai baru dikunci & diteruskan ke PT Pupuk Indonesia untuk persiapan logistik.',
                extraUpdates: ['status_logistik' => 'NONE']
            );

            $order->refresh();

            // 📧 Kirim Email ke Koperasi DAN Dinas
            $this->sendEmailToCooperative($order);
            $this->sendEmailToDinas($order);

            return $response;
        }

        // Action APPROVE
        $order->update([
            'status_verifikasi' => 'APPROVED',
            'status_logistik' => 'NONE',
            'notes_from_verifier' => $request->notes
        ]);

        // 📧 Kirim Email ke Koperasi DAN Dinas
        $this->sendEmailToCooperative($order);
        $this->sendEmailToDinas($order);

        return response()->json([
            'success' => true, 
            'message' => 'Dokumen disetujui Kemenko. Alokasi kuota dikunci dan diteruskan ke PT Pupuk Indonesia untuk persiapan logistik.'
        ]);
    }

    /* =========================================================================
     * HELPER METHODS UNTUK NOTIFIKASI EMAIL
     * ========================================================================= */

    /**
     * Helper Method: Kirim Email ke Koperasi
     */
    private function sendEmailToCooperative(ProcurementOrder $order): void
    {
        try {
            $cooperativeEmail = $order->cooperative->email_cooperative ?? null;

            if ($cooperativeEmail) {
                Mail::to($cooperativeEmail)->send(new ProcurementVerifiedMail($order));
                \Log::info("Email verifikasi berhasil dikirim ke Koperasi: {$cooperativeEmail} (Order PO: {$order->po_number})");
            } else {
                \Log::warning("Gagal kirim email: Koperasi ID {$order->cooperative_id} tidak memiliki 'email_cooperative'.");
            }
        } catch (\Exception $e) {
            \Log::error("Gagal kirim email ke Koperasi: " . $e->getMessage());
        }
    }

    /**
     * Helper Method: Kirim Email ke Dinas Pertanian Kabupaten Terkait
     */
    private function sendEmailToDinas(ProcurementOrder $order): void
    {
        try {
            if ($order->cooperative && $order->cooperative->city_koor) {
                $dinasUser = User::role('dinas-pertanian')
                    ->whereRaw('LOWER(city_code) = ?', [strtolower($order->cooperative->city_koor)])
                    ->first();

                if ($dinasUser && $dinasUser->email) {
                   Mail::to($dinasUser->email)->send(new ProcurementSubmittedMail($order, 'Dinas Pertanian'));
                    \Log::info("Email notifikasi berhasil dikirim ke Dinas: {$dinasUser->email} (Kab/Kota: {$order->cooperative->city_koor})");
                } else {
                    \Log::warning("Gagal kirim email: Tidak ditemukan User Dinas Pertanian untuk city_code {$order->cooperative->city_koor}.");
                }
            }
        } catch (\Exception $e) {
            \Log::error("Gagal kirim email ke Dinas Pertanian: " . $e->getMessage());
        }
    }

    /**
     * Helper Method: Kirim Email ke Admin / Role Kemenko
     */
    private function sendEmailToKemenko(ProcurementOrder $order): void
    {
        try {
            $kemenkoEmails = User::role('kemenko-pangan')->pluck('email')->filter();

            if ($kemenkoEmails->isNotEmpty()) {
               Mail::to($kemenkoEmails)->send(new ProcurementSubmittedMail($order, 'Kemenko'));
                \Log::info("Email pengajuan berhasil dikirim ke Kemenko: " . implode(', ', $kemenkoEmails->toArray()));
            } else {
                \Log::warning("Gagal kirim email: Tidak ditemukan User dengan role 'kemenko'.");
            }
        } catch (\Exception $e) {
            \Log::error("Gagal kirim email ke Kemenko: " . $e->getMessage());
        }
    }

    /**
     * HELPER BERSAMA: Menerapkan penyesuaian (ADJUST) item PO
     */
    private function applyAdjustment(
        ProcurementOrder $order,
        Request $request,
        string $stage,
        string $nextStatus,
        string $successMessage,
        array $extraUpdates = []
    ): JsonResponse {
        DB::beginTransaction();
        try {
            $order->load('items');

            $itemsBefore = $order->items->map(function ($item) {
                return $item->only([
                    'id', 'fertilizer_id', 'fertilizer_name',
                    'final_bags_ordered', 'final_weight_kg',
                    'packaging_size_kg', 'price_per_kg',
                    'harga_per_karung', 'subtotal_price',
                ]);
            })->toArray();

            $totalsBefore = [
                'total_bags_ordered' => $order->total_bags_ordered,
                'total_weight_kg' => $order->total_weight_kg,
                'total_estimated_cost' => $order->total_estimated_cost,
            ];

            foreach ($request->items as $revisedItem) {
                $item = $order->items->firstWhere('id', $revisedItem['id']);

                if (!$item) continue;

                $newBags = (int) $revisedItem['final_bags_ordered'];
                $newWeight = $newBags * $item->packaging_size_kg;
                $newSubtotal = $newBags * $item->harga_per_karung;

                $item->update([
                    'final_bags_ordered' => $newBags,
                    'final_weight_kg' => $newWeight,
                    'subtotal_price' => $newSubtotal,
                ]);
            }

            $order->load('items');
            $totalBags = $order->items->sum('final_bags_ordered');
            $totalKg = $order->items->sum('final_weight_kg');
            $totalCost = $order->items->sum('subtotal_price');

            $itemsAfter = $order->items->map(function ($item) {
                return $item->only([
                    'id', 'fertilizer_id', 'fertilizer_name',
                    'final_bags_ordered', 'final_weight_kg',
                    'packaging_size_kg', 'price_per_kg',
                    'harga_per_karung', 'subtotal_price',
                ]);
            })->toArray();

            $totalsAfter = [
                'total_bags_ordered' => $totalBags,
                'total_weight_kg' => $totalKg,
                'total_estimated_cost' => $totalCost,
            ];

            ProcurementOrderRevision::create([
                'procurement_order_id' => $order->id,
                'stage' => $stage,
                'revised_by_user_id' => $request->user()?->id,
                'reason' => $request->adjustment_reason,
                'items_before' => $itemsBefore,
                'items_after' => $itemsAfter,
                'totals_before' => $totalsBefore,
                'totals_after' => $totalsAfter,
            ]);

            $order->update(array_merge([
                'status_verifikasi' => $nextStatus,
                'total_bags_ordered' => $totalBags,
                'total_weight_kg' => $totalKg,
                'total_estimated_cost' => $totalCost,
                'notes_from_verifier' => $request->adjustment_reason,
            ], $extraUpdates));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $successMessage,
                'data' => $order->fresh('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses penyesuaian pengadaan: ' . $e->getMessage()
            ], 500);
        }
    }

   /**
     * STAGE 3B: RILIS PENGIRIMAN LOGISTIK OLEH KEMENKO
     */
    public function dispatchShipmentByKemenko($id): JsonResponse
    {
        $order = ProcurementOrder::with('cooperative')->findOrFail($id);

        if (!in_array($order->status_verifikasi, self::APPROVED_STATUSES) || $order->status_logistik !== 'NONE') {
            return response()->json(['success' => false, 'message' => 'Logistik tidak dapat dirilis.'], 400);
        }

        $destLat = (float) $order->cooperative->latitude;
        $destLng = (float) $order->cooperative->longitude;

        $distanceKm = $this->calculateHaversineDistance(
            (float)$order->origin_lat, (float)$order->origin_lng, 
            $destLat, $destLng
        );

        $jawaProvinceIds = [31, 32, 33, 34, 35, 36]; 
        $cooperativeProvinceId = (int) $order->cooperative->province_id;

        $isCrossIsland = !in_array($cooperativeProvinceId, $jawaProvinceIds);

        $travelHours = 0;
        $logistikNotes = [];

        if ($isCrossIsland) {
            $landDistance = $distanceKm * 0.7;
            $seaDistance = $distanceKm * 0.3;

            $truckDrivingHours = $landDistance / self::TRUCK_SPEED_KMH;
            $vesselSailingHours = $seaDistance / self::VESSEL_SPEED_KMH;
            $portHurdle = self::PORT_BUFFER_HOURS; 

            $travelHours = $truckDrivingHours + $vesselSailingHours + $portHurdle;

            $logistikNotes[] = "Rute Lintas Pulau terdeteksi.";
            $logistikNotes[] = "Estimasi Darat: " . round($landDistance, 1) . " Km via Truk.";
            $logistikNotes[] = "Estimasi Laut: " . round($seaDistance, 1) . " Km via Kapal Laut.";
            $logistikNotes[] = "Hambatan Pelabuhan (Antrean & Bongkar Muat): +" . self::PORT_BUFFER_HOURS . " Jam.";
        } else {
            $truckDrivingHours = $distanceKm / self::TRUCK_SPEED_KMH;
            $travelHours = $truckDrivingHours;
            $logistikNotes[] = "Rute Intra-Pulau (Darat). Jarak Tempuh: " . round($distanceKm, 1) . " Km.";
        }

        $drivingDaysCount = floor($travelHours / self::MAX_DRIVING_HOURS_PER_DAY);
        if ($drivingDaysCount > 0) {
            $totalRestHours = $drivingDaysCount * self::DRIVER_REST_DURATION_HOURS;
            $travelHours += $totalRestHours;
            $logistikNotes[] = "Regulasi K3 Supir: Perjalanan jauh membutuhkan " . $drivingDaysCount . "x istirahat malam (Total +" . $totalRestHours . " Jam).";
        }

        $shortBreaksCount = floor($travelHours / 4);
        if ($shortBreaksCount > 0) {
            $travelHours += ($shortBreaksCount * 1.5);
            $logistikNotes[] = "Kombinasi Jetlag & Istirahat Pendek (Makan/Ibadah): +" . ($shortBreaksCount * 1.5) . " Jam.";
        }

        $estimatedHours = (int) ceil($travelHours);

        $order->update([
            'status_logistik' => 'PROD_LINI_1_2', 
            'destination_lat' => $destLat,
            'destination_lng' => $destLng,
            'gis_distance_km' => round($distanceKm, 2),
            'estimated_travel_hours' => $estimatedHours,
            'dispatched_at' => now(),
            'notes_from_verifier' => implode(" | ", $logistikNotes)
        ]);

        // 📧 1. RILIS ARMADA: Kirim Notifikasi ke Koperasi & Dinas Pertanian
        $this->sendEmailToCooperative($order);
        $this->sendEmailToDinasVerifiedNotice($order);

        return response()->json([
            'success' => true, 
            'message' => 'Armada logistik resmi dirilis dari pusat. Perhitungan komprehensif logistik aktif.',
            'gis_info' => [
                'jarak_riil' => round($distanceKm, 2) . ' Km',
                'estimasi_waktu_realistis' => $estimatedHours . ' Jam',
                'lintas_pulau' => $isCrossIsland ? 'Ya (Kombinasi Multimoda Laut/Darat)' : 'Tidak (Jalur Darat Kontinu)',
                'log_simulasi' => $logistikNotes
            ]
        ]);
    }

    /**
     * STAGE 4: DINAS PERTANIAN KLIK SAAT PUPUK TIBA DI KABUPATEN (LINI 3)
     */
    public function updateToLiniTiga(Request $request, $id): JsonResponse
    {
        $request->validate([
            'items' => 'nullable|array',
            'items.*.id' => 'required_with:items|integer|exists:procurement_order_items,id',
            'items.*.actual_received_bags' => 'required_with:items|integer|min:0',
            'receipt_notes' => 'nullable|string',
        ]);

        $order = ProcurementOrder::with(['items', 'cooperative'])->findOrFail($id);

        if ($order->status_logistik !== 'PROD_LINI_1_2') {
            return response()->json([
                'success' => false,
                'message' => 'Status logistik tidak valid untuk penerimaan di Lini 3.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            if ($request->has('items') && is_array($request->items)) {
                foreach ($request->items as $itemData) {
                    $item = $order->items->firstWhere('id', $itemData['id']);
                    if ($item) {
                        $item->update([
                            'actual_received_bags' => $itemData['actual_received_bags']
                        ]);
                    }
                }
            }

            $order->update([
                'status_logistik' => 'GUDANG_LINI_3',
                'dinas_received_at' => now(),
                'receipt_notes' => $request->receipt_notes ?? $order->receipt_notes,
            ]);

            DB::commit();

            // 📧 2. PUPUK TIBA DI DINAS (LINI 3): Kirim Notifikasi ke Kemenko & Koperasi
            $this->sendEmailToKemenkoVerifiedNotice($order);
            $this->sendEmailToCooperative($order);

            return response()->json([
                'success' => true, 
                'message' => 'Dinas mengonfirmasi pupuk telah tiba di Lini 3 Kabupaten & catatan fisik berhasil disimpan.',
                'data' => $order->fresh('items')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengonfirmasi penerimaan Lini 3: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * MELEPAS JATAH TEBUS KE LINI 4
     */
    public function releaseToLiniEmpat($id): JsonResponse
    {
        $order = ProcurementOrder::with('cooperative')->findOrFail($id);
        
        $order->update([
            'status_logistik' => 'SIAP_TEBUS_LINI_4'
        ]);

        // 📧 Notifikasi tambahan ke Koperasi bahwa jatah pupuk sudah dapat ditebus
        $this->sendEmailToCooperative($order);

        return response()->json(['success' => true, 'message' => 'Kuota resmi dilepas Dinas. Koperasi sekarang dapat menebus pupuk bersubsidi ini.']);
    }

    /**
     * STAGE 5: KOPERASI KLIK SAAT FISIK PUPUK SUDAH BONGKAR DI GUDANG KOPERASI (SELESAI)
     */
    public function completeOrder($id): JsonResponse
    {
        $order = ProcurementOrder::with(['items', 'cooperative'])->findOrFail($id);

        if ($order->status_logistik !== 'SIAP_TEBUS_LINI_4') {
            return response()->json([
                'success' => false,
                'message' => 'Pengadaan belum dirilis oleh Dinas Pertanian, tidak dapat dikonfirmasi selesai.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($order->items as $item) {
                $receivedBags = $item->actual_received_bags ?? $item->final_bags_ordered;
                $receivedWeightKg = $receivedBags * $item->packaging_size_kg;

                // 1. Tambahkan stok ke tabel fertilizers
                DB::table('fertilizers')
                    ->where('id', $item->fertilizer_id)
                    ->increment('current_stock_kg', $receivedWeightKg);

                // 2. Catat riwayat mutasi masuk 
                InventoryMutation::create([
                    'fertilizer_id' => $item->fertilizer_id,
                    'farmer_id' => null,
                    'type' => 'masuk',
                    'quantity_kg' => (int) $receivedWeightKg,
                    'description' => 'Penerimaan pengadaan PO ' . $order->po_number . ' (' . $receivedBags . ' karung)',
                ]);
            }

            $order->update([
                'status_logistik' => 'SELESAI',
                'completed_at' => now()
            ]);

            DB::commit();

            // 📧 3. TIBA DI KOPERASI / SELESAI: Kirim Notifikasi ke Dinas Pertanian & Kemenko
            $this->sendEmailToDinasVerifiedNotice($order);
            $this->sendEmailToKemenkoVerifiedNotice($order);

            return response()->json([
                'success' => true,
                'message' => 'Selesai! Stok pupuk resmi diterima fisik & ditambahkan ke sistem gudang Koperasi.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses penerimaan stok: ' . $e->getMessage()
            ], 500);
        }
    }



    /**
     * Helper Method: Kirim Update Status/Logistik ke Dinas Pertanian
     */
    private function sendEmailToDinasVerifiedNotice(ProcurementOrder $order): void
    {
        try {
            if ($order->cooperative && $order->cooperative->city_koor) {
                $dinasUser = User::role('dinas-pertanian')
                    ->whereRaw('LOWER(city_code) = ?', [strtolower($order->cooperative->city_koor)])
                    ->first();

                if ($dinasUser && $dinasUser->email) {
                    Mail::to($dinasUser->email)->send(new ProcurementVerifiedMail($order));
                    \Log::info("Email update logistik berhasil dikirim ke Dinas: {$dinasUser->email}");
                }
            }
        } catch (\Exception $e) {
            \Log::error("Gagal kirim update logistik ke Dinas: " . $e->getMessage());
        }
    }

    /**
     * Helper Method: Kirim Update Status/Logistik ke Kemenko
     */
    private function sendEmailToKemenkoVerifiedNotice(ProcurementOrder $order): void
    {
        try {
            $kemenkoEmails = User::role('kemenko-pangan')->pluck('email')->filter();

            if ($kemenkoEmails->isNotEmpty()) {
                Mail::to($kemenkoEmails)->send(new ProcurementVerifiedMail($order));
                \Log::info("Email update logistik berhasil dikirim ke Kemenko: " . implode(', ', $kemenkoEmails->toArray()));
            }
        } catch (\Exception $e) {
            \Log::error("Gagal kirim update logistik ke Kemenko: " . $e->getMessage());
        }
    }

    /**
     * UTILITY: Rumus Haversine GIS
     */
    private function calculateHaversineDistance($lat1, $lon1, $lat2, $lon2): float
    {
        $earthRadius = 6371; 

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
}