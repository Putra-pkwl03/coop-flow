import os
from contextlib import asynccontextmanager
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

# Penampung objek pkl di level memory teratas
storage_model = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Memuat berkas pkl model1 dan model2 saat startup aplikasi."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # Menyesuaikan nama berkas model pkl asli Anda
        model1_path = os.path.join(base_dir, "models", "model1_kebutuhan_pupuk.pkl")
        model2_path = os.path.join(base_dir, "models", "model2_pengadaan_koperasi.pkl")
        
        storage_model["model1_kebutuhan"] = joblib.load(model1_path)
        storage_model["model2_pengadaan"] = joblib.load(model2_path)
        print("INFO: Seluruh model Machine Learning berhasil dimuat ke memori.")
    except Exception as e:
        print(f"ERROR: Gagal memuat berkas pkl: {str(e)}")
        raise e
    yield
    storage_model.clear()

app = FastAPI(title="COOP-FLOW ML Engine", lifespan=lifespan)

# ==========================================
# PYDANTIC REQUEST SCHEMAS (Parameter Model)
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

class Model2Request(BaseModel):
    jenis_pupuk: str
    bulan: int
    hari_libur_nasional: int
    stok_tersedia_saat_ini_kg: float
    total_prediksi_kebutuhan_petani_sebulan_ke_depan_kg: float
    provinsi_koperasi: str
    asumsi_lead_time_hari: int


# ==========================================
# CORE API ENDPOINTS
# ==========================================

@app.get("/")
def check_status_via_browser():
    return {"status": "online", "engine": "COOP-FLOW ML Engine"}


@app.post("/predict/fertilizer")
async def predict_fertilizer_need(payload: Model1Request):
    """
    Model 1: Memprediksi banyaknya dosis pupuk yang sebaiknya digunakan petani.
    """
    try:
        # Konversi payload Pydantic menjadi pandas DataFrame
        data_input = pd.DataFrame([payload.model_dump()])
        
        # Eksekusi prediksi dari model1_kebutuhan_pupuk.pkl
        hasil_prediksi = storage_model["model1_kebutuhan"].predict(data_input)
        
        # Mengembalikan nilai prediksi (jika output tunggal regresi berformat array/list)
        rekomendasi_output = float(hasil_prediksi[0]) if hasattr(hasil_prediksi, "__len__") else float(hasil_prediksi)
        
        return {
            "status": "success",
            "recommended_dosage_kg": round(rekomendasi_output, 2)
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Gagal memproses prediksi Model 1: {str(error)}"
        )


@app.post("/forecast/stock")
async def predict_procurement_stock(payload: Model2Request):
    """
    Model 2: Memprediksi kuantitas dan waktu terbaik untuk mengadakan pengadaan stok pupuk.
    """
    try:
        data_input = pd.DataFrame([payload.model_dump()])
        
        # Eksekusi prediksi dari model2_pengadaan_koperasi.pkl
        hasil_prediksi = storage_model["model2_pengadaan"].predict(data_input)
        
        # Asumsi output model berupa jumlah pengadaan ideal dalam kg
        jumlah_pengadaan_kg = float(hasil_prediksi[0]) if hasattr(hasil_prediksi, "__len__") else float(hasil_prediksi)
        
        return {
            "status": "success",
            "suggested_procurement_kg": max(0.0, round(jumlah_pengadaan_kg, 2)),
            "message": "Rekomendasi waktu pengadaan dihitung berdasarkan parameter lead time pengiriman."
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f"Gagal memproses prediksi Model 2: {str(error)}"
        )