import os
import asyncio
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from typing import List, Optional
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from gee_service import (
    init_gee, 
    calculate_land_ndvi, 
    get_ndvi_history, 
    get_all_lands_ndvi_map_tile
)

# Penampung objek pkl di level memory teratas
storage_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Memuat berkas pkl model1, model2, dan inisialisasi GEE saat startup aplikasi."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Inisialisasi Google Earth Engine
    try:
        init_gee()
        print("INFO: Google Earth Engine (GEE) berhasil terautentikasi.")
    except Exception as e:
        print(f"WARNING: Gagal inisialisasi GEE (Cek file credentials): {str(e)}")

    # 2. Load Model Machine Learning
    try:
        model1_path = os.path.join(base_dir, "models", "model_pupuk_presisi.pkl")
        model2_path = os.path.join(base_dir, "models", "model2_pengadaan_koperasi.pkl")
        
        if os.path.exists(model1_path):
            storage_model["model1_kebutuhan"] = joblib.load(model1_path)
            print("INFO: Model 1 (Pupuk Presisi) berhasil dimuat.")
        else:
            print(f"WARNING: File {model1_path} tidak ditemukan.")
        
        if os.path.exists(model2_path):
            storage_model["model2_pengadaan"] = joblib.load(model2_path)
            print("INFO: Model 2 (Pengadaan Koperasi) berhasil dimuat.")
        else:
            print(f"WARNING: File {model2_path} tidak ditemukan.")

    except Exception as e:
        print(f"ERROR: Gagal memuat berkas pkl: {str(e)}")

    yield
    storage_model.clear()

app = FastAPI(title="COOP-FLOW ML & GEE Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PYDANTIC REQUEST SCHEMAS
# ==========================================

class Model1Request(BaseModel):
    luas_lahan_hektar: float
    jenis_komoditas: str
    fase_tanam_saat_ini: str
    jenis_pupuk_input: str
    jumlah_pupuk_fase_sebelumnya_kg: float
    fase_tanam_sebelumnya: str
    curah_hujan_mm: float
    suhu_rata_rata_celcius: float
    kelembapan_persen: float
    ndvi: float 

class Model2Request(BaseModel):
    jenis_pupuk: str
    bulan: int
    hari_libur_nasional: int
    stok_tersedia_saat_ini_kg: float
    total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg: float
    provinsi_koperasi: str
    asumsi_lead_time_hari: int

class PolygonRequest(BaseModel):
    coordinates: List[List[float]] = Field(
        ..., 
        example=[[110.36, -7.80], [110.37, -7.80], [110.37, -7.81], [110.36, -7.80]]
    )
    start_date: Optional[str] = None 
    end_date: Optional[str] = None 

# FIX 2: Tambahkan Schema MultiPolygonRequest untuk menerima array poligon dari Laravel
class MultiPolygonRequest(BaseModel):
    polygons: List[List[List[float]]] 
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class HistoryRequest(BaseModel):
    coordinates: List[List[float]]
    days_back: int = Field(default=90, description="Rentang hari ke belakang untuk grafik")


# ==========================================
# CORE API ENDPOINTS
# ==========================================

@app.get("/")
def check_status_via_browser():
    return {
        "status": "online", 
        "engine": "COOP-FLOW ML & Earth Engine Service",
        "gee_status": "active"
    }


@app.post("/api/v1/analyze-land")
async def analyze_land_satellite(payload: PolygonRequest):
    try:
        coords = payload.coordinates

        if not coords or len(coords) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Koordinat poligon minimal harus memiliki 3 titik pasang."
            )

        if coords[0] != coords[-1]:
            coords.append(coords[0])

        today = datetime.now()
        end_date = payload.end_date or today.strftime("%Y-%m-%d")
        start_date = payload.start_date or (today - timedelta(days=90)).strftime("%Y-%m-%d")

        gee_result = await asyncio.to_thread(
            calculate_land_ndvi,
            polygon_coordinates=coords,
            start_date=start_date,
            end_date=end_date
        )

        ndvi_score = gee_result.get("ndvi")
        acquisition_date = gee_result.get("acquisition_date")
        ndvi_trend = gee_result.get("ndvi_trend", 0.0)
        is_active_crop = gee_result.get("is_active_crop", False)

        if ndvi_score is None:
            status_kesehatan = "Data citra satelit tidak tersedia"
        elif ndvi_score < 0.20:
            status_kesehatan = "Lahan Kosong / Bera / Awal Pengolahan Tanah"
        elif ndvi_score < 0.50:
            if not is_active_crop and ndvi_trend <= 0.02:
                status_kesehatan = "Lahan Tidak Ditanami (Dominasi Rumput Liar / Gulma)"
            else:
                status_kesehatan = "Fase Vegetatif Awal (Pertumbuhan Tanaman Budidaya)"
        else:
            if ndvi_trend < -0.15:
                status_kesehatan = "Fase Generatif Akhir / Memasuki Masa Panen"
            else:
                status_kesehatan = "Vegetasi Sangat Sehat / Lebat (Pertumbuhan Optimal)"

        return {
            "status": "success",
            "data": {
                "ndvi": ndvi_score,
                "ndvi_trend_30days": ndvi_trend,
                "is_active_crop": is_active_crop,
                "acquisition_date": acquisition_date,
                "vegetation_status": status_kesehatan
            }
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses analisis GEE: {str(error)}"
        )


# FIX 3: Tambahkan Route Endpoint Baru untuk Gabungan Seluruh Lahan
@app.post("/api/v1/lands/all-ndvi-map-tile")
async def get_all_lands_ndvi_tile(payload: MultiPolygonRequest):
    try:
        today = datetime.now()
        end_date = payload.end_date or today.strftime("%Y-%m-%d")
        start_date = payload.start_date or (today - timedelta(days=90)).strftime("%Y-%m-%d")

        map_tile_result = await asyncio.to_thread(
            get_all_lands_ndvi_map_tile,
            polygons_coordinates=payload.polygons,
            start_date=start_date,
            end_date=end_date
        )

        if not map_tile_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citra satelit tidak ditemukan."
            )

        return {
            "status": "success",
            "data": map_tile_result
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses Tile Peta NDVI: {str(error)}"
        )


@app.post("/api/v1/land/ndvi-history")
async def get_land_ndvi_history(payload: HistoryRequest):
    try:
        coords = payload.coordinates
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        history_data = await asyncio.to_thread(
            get_ndvi_history,
            polygon_coordinates=coords,
            days_back=payload.days_back
        )

        return {
            "status": "success",
            "total_points": len(history_data),
            "data": history_data
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses histori NDVI: {str(error)}"
        )


# ------------------------------------------
# ENDPOINT ML MODEL 1 & MODEL 2
# ------------------------------------------
@app.post("/predict/fertilizer")
async def predict_fertilizer_need(payload: Model1Request):
    try:
        if "model1_kebutuhan" not in storage_model:
            raise HTTPException(status_code=500, detail="Model 1 belum siap di memori.")

        data_input = pd.DataFrame([payload.model_dump()])
        
        hasil_prediksi = await asyncio.to_thread(storage_model["model1_kebutuhan"].predict, data_input)
        rekomendasi_output = float(hasil_prediksi[0]) if hasattr(hasil_prediksi, "__len__") else float(hasil_prediksi)
        
        return {
            "status": "success",
            "recommended_dosage_kg": round(rekomendasi_output, 2)
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Gagal memproses prediksi Model 1: {str(error)}"
        )


@app.post("/forecast/stock")
async def predict_procurement_stock(payload: Model2Request):
    try:
        if "model2_pengadaan" not in storage_model:
            raise HTTPException(status_code=500, detail="Model 2 belum siap di memori.")

        data_input = pd.DataFrame([payload.model_dump()])
        
        hasil_prediksi = await asyncio.to_thread(storage_model["model2_pengadaan"].predict, data_input)
        jumlah_pengadaan_kg = float(hasil_prediksi[0]) if hasattr(hasil_prediksi, "__len__") else float(hasil_prediksi)
        
        return {
            "status": "success",
            "suggested_procurement_kg": max(0.0, round(jumlah_pengadaan_kg, 2)),
            "message": "Rekomendasi waktu pengadaan dihitung berdasarkan parameter lead time pengiriman."
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Gagal memproses prediksi Model 2: {str(error)}"
        )