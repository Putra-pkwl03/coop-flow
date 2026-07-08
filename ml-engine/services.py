import os
import joblib
import pandas as pd
from prophet import Prophet

class MLServiceCoopFlow:
    def __init__(self):
        # Menentukan base path folder model pkl
        self.folder_model = os.path.join(os.path.dirname(__file__), "app", "models-ml")
        self.model_pupuk_presisi = None
        self.model_stok_forecasting = None
        self.load_semua_model()

    def load_semua_model(self):
        """Memuat berkas asli .pkl ke dalam memori server RAM"""
        path_pupuk_presisi = os.path.join(self.folder_model, "model_pupuk_presisi.pkl")
        path_stok_forecasting = os.path.join(self.folder_model, "model_stok_forecasting.pkl")

        if os.path.exists(path_pupuk_presisi):
            try:
                self.model_pupuk_presisi = joblib.load(path_pupuk_presisi)
                print("✅ [ML Engine] model_pupuk_presisi.pkl berhasil dimuat.")
            except Exception as e:
                print(f"❌ [ML Engine] Gagal memuat model presisi: {e}")

        if os.path.exists(path_stok_forecasting):
            try:
                self.model_stok_forecasting = joblib.load(path_stok_forecasting)
                print("✅ [ML Engine] model_stok_forecasting.pkl berhasil dimuat.")
            except Exception as e:
                print(f"❌ [ML Engine] Gagal memuat model forecasting: {e}")

    def predict_pupuk_petani(self, land_area: float, crop_type: str, fase_tanam: str, curah_hujan: float, kelembapan: float, suhu: float):
        """Logika kalkulasi jatah pupuk individu petani menggunakan Scikit-Learn"""
        if self.model_pupuk_presisi is None:
            # Fallback otomatis berupa rumus default jika file .pkl bermasalah
            return {"urea_kg": land_area * 100, "npk_kg": land_area * 50, "total_fertilizer_kg": land_area * 150}
        
        try:
            # Membuat DataFrame dengan nama kolom persis seperti saat fase training di Jupyter Notebook
            tabel_input = pd.DataFrame([{
                "luas_lahan_hektar": land_area,
                "jenis_komoditas": crop_type,
                "fase_tanam": fase_tanam,
                "curah_hujan_mm": curah_hujan,
                "kelembapan_persen": kelembapan,
                "suhu_rata_rata_celcius": suhu
            }])
            
            # Melakukan kalkulasi prediksi via model pipeline asli
            prediksi_array = self.model_pupuk_presisi.predict(tabel_input)[0]
            
            # Memisahkan hasil output ganda (Multi-Output) Urea & NPK
            if hasattr(prediksi_array, "__len__") and len(prediksi_array) >= 2:
                angka_urea = float(prediksi_array[0])
                angka_npk = float(prediksi_array[1])
                return {
                    "urea_kg": round(angka_urea, 2),
                    "npk_kg": round(angka_npk, 2),
                    "total_fertilizer_kg": round(angka_urea + angka_npk, 2)
                }
            else:
                return {"total_fertilizer_kg": round(float(prediksi_array), 2)}
                
        except Exception as e:
            print(f"⚠️ Gagal memproses model presisi, menggunakan fallback dummy: {e}")
            return {"urea_kg": land_area * 100, "npk_kg": land_area * 50, "total_fertilizer_kg": land_area * 150}

    def predict_stok_koperasi(self, days: int):
        """Logika peramalan logistik pengadaan gudang menggunakan Facebook Prophet"""
        if self.model_stok_forecasting is None or days <= 0:
            return None
        
        try:
            # Membuat susunan tanggal masa depan khusus algoritma Prophet
            future_dates = self.model_stok_forecasting.make_future_dataframe(periods=days, freq='D')
            prediksi_prophet = self.model_stok_forecasting.predict(future_dates)
            
            # Memotong data dan mengambil baris hari masa depan teratas (tail)
            tabel_hasil = prediksi_prophet[['ds', 'yhat']].tail(days)
            tabel_hasil['ds'] = tabel_hasil['ds'].dt.strftime('%Y-%m-%d')
            
            # Mengubah tabel pandas DataFrame menjadi bentuk List JSON Array
            return tabel_hasil.to_dict(orient='records')
        except Exception as e:
            print(f"⚠️ Gagal memproses forecasting stok: {e}")
            return None