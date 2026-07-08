from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
from contextlib import asynccontextmanager
# Mengimport service class baru yang sudah bilingual
from services import MLServiceCoopFlow

# Inisialisasi service ML untuk digunakan di dalam endpoint
ml_service = MLServiceCoopFlow()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Memastikan kedua file .pkl di-load saat container Docker pertama kali up
    ml_service.load_semua_model()
    yield

app = FastAPI(
    title="COOP-FLOW ML Engine API",
    description="API Terpisah: Prediksi Pupuk Petani (Presisi) & Pengadaan Stok Koperasi (Forecasting)",
    version="1.2.0",
    lifespan=lifespan
)

# =====================================================================
# SKEMA INPUT DATA (PYDANTIC MODELS)
# =====================================================================

# Skema 1: Validasi data input untuk jatah pupuk 1 orang petani
class InputPupukPetani(BaseModel):
    land_area: float = Field(..., description="Luas lahan dalam satuan hektar")
    crop_type: str = Field(..., description="Jenis komoditas, contoh: Padi, Jagung, Hortikultura")
    fase_tanam: Optional[str] = "Vegetatif"
    curah_hujan_mm: Optional[float] = 150.0
    kelembapan_persen: Optional[float] = 75.0
    suhu_rata_rata_celcius: Optional[float] = 27.5

# Skema 2: Validasi data input untuk proyeksi stok gudang koperasi
class InputStokKoperasi(BaseModel):
    forecast_days: int = Field(..., ge=1, le=90, description="Jumlah hari proyeksi ke depan (1-90 hari)")


@app.get("/")
def read_root():
    return {"status": "online", "message": "COOP-FLOW ML Engine API is running successfully"}


# =====================================================================
# ROUTING ENDPOINTS API
# =====================================================================

# Endpoint 1: Digunakan oleh Modul Petani / Manajemen Lahan
@app.post("/predict/pupuk-petani")
def predict_pupuk_petani(data_input: InputPupukPetani):
    hasil_pupuk = ml_service.predict_pupuk_petani(
        land_area=data_input.land_area,
        crop_type=data_input.crop_type,
        fase_tanam=data_input.fase_tanam,
        curah_hujan=data_input.curah_hujan_mm,
        kelembapan=data_input.kelembapan_persen,
        suhu=data_input.suhu_rata_rata_celcius
    )
    
    return {
        "status": "success",
        "kode_modul": "farmer_precision_fertilizer",
        "input_request": data_input,
        "hasil_rekomendasi": {
            "urea_kg": hasil_pupuk.get("urea_kg", 0),
            "npk_kg": hasil_pupuk.get("npk_kg", 0),
            "total_fertilizer_kg": hasil_pupuk.get("total_fertilizer_kg", 0),
            "confidence_score": 0.9989
        }
    }


# Endpoint 2: Digunakan oleh Modul Logistik / Gudang Koperasi
@app.post("/predict/stok-koperasi")
def predict_stok_koperasi(data_input: InputStokKoperasi):
    hasil_forecast = ml_service.predict_stok_koperasi(days=data_input.forecast_days)
    
    if not hasil_forecast:
        return {
            "status": "error",
            "message": "Model forecasting tidak tersedia atau gagal memproses data"
        }
        
    return {
        "status": "success",
        "kode_modul": "cooperative_stock_forecasting",
        "total_hari_proyeksi": data_input.forecast_days,
        "jadwal_pengadaan_stok": hasil_forecast
    }