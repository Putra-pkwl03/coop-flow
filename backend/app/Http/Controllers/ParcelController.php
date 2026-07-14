<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Parcel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParcelController extends Controller
{
    // Konstruktor untuk membatasi akses berdasarkan Role menggunakan Spatie middleware
    public function __construct()
    {
        $this->middleware(['role:admin-lapangan'])->only(['store']);
        $this->middleware(['auth:sanctum']); 
    }

    // Menyimpan Lahan Baru dengan Data Spasial Polygon
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'area_hectares' => 'required|numeric',
            'coordinates' => 'required|array', // Menerima array koordinat dari Leaflet
        ]);

        // Konversi koordinat array menjadi format WKT (Well-Known Text) POLYGON untuk PostGIS
            $coordString = collect($request->coordinates)->map(function($coord) {
            return $coord['lng'] . ' ' . $coord['lat'];
        })->implode(', ');
        
        $firstCoord = $request->coordinates[0]['lng'] . ' ' . $request->coordinates[0]['lat'];
        $wktPolygon = "POLYGON(($coordString, $firstCoord))";

        $parcel = Parcel::create([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'area_hectares' => $request->area_hectares,
            'status' => 'active',
            'geom' => DB::raw("ST_GeomFromText('{$wktPolygon}', 4326)")
        ]);

        return response()->json([
            'message' => 'Lahan spasial berhasil disimpan!',
            'data' => $parcel
        ], 21);
    }
}