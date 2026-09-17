import os
import ee
import json
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional

# KEY_FILE = os.path.join(os.path.dirname(__file__), 'credentials', 'gee-key.json')

# def init_gee():
#     try:
#         ee.Initialize()
#     except Exception:
#         if os.path.exists(KEY_FILE):
#             credentials = ee.ServiceAccountCredentials(email=None, key_file=KEY_FILE)
#             ee.Initialize(credentials=credentials)
#         else:
#             raise FileNotFoundError(f"File kredensial GEE tidak ditemukan di: {KEY_FILE}")

google_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")

if google_json:
    service_account_info = json.loads(google_json)
    credentials = ee.ServiceAccountCredentials(
        service_account_info['client_email'],
        key_data=google_json
    )
    ee.Initialize(credentials)
    print("Inisialisasi GEE Berhasil via Environment Variable!")
else:
    print("WARNING: Credentials not found!")

def mask_s2_clouds_scl(image):
    """
    Masking tingkat tinggi menggunakan Band SCL (Scene Classification Layer) Sentinel-2 SR.
    Membuang Awan, Bayangan Awan, Cirrus, dan Salju/Air Anomali.
    """
    scl = image.select('SCL')
    
    # Kelas SCL yang VALID / BERSIH:
    # 4 = Vegetation, 5 = Bare Soils, 6 = Water, 7 = Unclassified / Low prob
    valid_mask = (
        scl.eq(4)
        .Or(scl.eq(5))
        .Or(scl.eq(6))
        .Or(scl.eq(7))
    )
    
    return image.updateMask(valid_mask).divide(10000)

def extract_ndvi_stats(image, aoi, raw_aoi):
    """Menghitung nilai Median NDVI pada AOI (dengan fallback centroid aman)."""
    cleaned = mask_s2_clouds_scl(image)
    ndvi = cleaned.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # 1. Coba ekstrak median NDVI pada inner buffer
    stats = ndvi.reduceRegion(
        reducer=ee.Reducer.median(),
        geometry=aoi,
        scale=10,
        bestEffort=True,
        maxPixels=1e9
    )
    val = stats.getInfo().get('NDVI', None)
    
    # 2. Fallback jika inner buffer menghasilkan None (misal lahan terlalu kecil)
    if val is None:
        point_stats = ndvi.reduceRegion(
            reducer=ee.Reducer.median(),
            geometry=raw_aoi.centroid(maxError=1),
            scale=10
        )
        val = point_stats.getInfo().get('NDVI', None)
        
    return round(val, 4) if val is not None else None

def calculate_land_ndvi(polygon_coordinates: list, start_date: str = None, end_date: str = None):
    """Menganalisis indeks vegetasi (NDVI) dan status aktif tanaman."""
    init_gee()

    today = datetime.now()
    if not end_date:
        end_date = today.strftime('%Y-%m-%d')
    if not start_date:
        start_date = (today - timedelta(days=90)).strftime('%Y-%m-%d')

    if isinstance(polygon_coordinates[0][0], (float, int)):
        coords_formatted = [polygon_coordinates]
    else:
        coords_formatted = polygon_coordinates

    raw_aoi = ee.Geometry.Polygon(coords_formatted, None, False)
    
    buffered_aoi = raw_aoi.buffer(-3)
    area_buffered = buffered_aoi.area(maxError=1).getInfo()
    
    aoi = buffered_aoi if area_buffered > 0 else raw_aoi

    dataset = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(raw_aoi)
        .filterDate(start_date, end_date)
        .sort('system:time_start', False)
    )

    total_images = dataset.size().getInfo()
    if total_images == 0:
        return {"ndvi": None, "acquisition_date": None, "ndvi_trend": 0.0, "is_active_crop": False}

    # 1. Citra Terbaru
    best_image = dataset.first()
    date_ms = best_image.get('system:time_start').getInfo()
    acquisition_date = datetime.fromtimestamp(date_ms / 1000.0).strftime('%Y-%m-%d')
    current_ndvi = extract_ndvi_stats(best_image, aoi, raw_aoi)

    # 2. Citra Pembanding (~30 Hari Lalu)
    previous_ndvi = None
    if total_images > 1:
        img_list = dataset.toList(total_images)
        for i in range(1, min(total_images, 8)):
            prev_img = ee.Image(img_list.get(i))
            prev_time = prev_img.get('system:time_start').getInfo()
            days_diff = (date_ms - prev_time) / (1000 * 3600 * 24)
            
            if days_diff >= 20:
                previous_ndvi = extract_ndvi_stats(prev_img, aoi, raw_aoi)
                break

    # 3. Hitung Selisih Tren Multitemporal
    ndvi_trend = 0.0
    if current_ndvi is not None and previous_ndvi is not None:
        ndvi_trend = round(current_ndvi - previous_ndvi, 4)

    is_active_crop = False
    if current_ndvi is not None:
        if current_ndvi >= 0.70 or (current_ndvi >= 0.45 and ndvi_trend >= 0.08):
            is_active_crop = True

    return {
        "ndvi": current_ndvi,
        "acquisition_date": acquisition_date,
        "ndvi_trend": ndvi_trend,
        "is_active_crop": is_active_crop
    }


def get_ndvi_history(polygon_coordinates: list, days_back: int = 90):
    """
    Mengambil deret waktu (time-series) NDVI untuk grafik pertumbuhan.
    Dioptimalkan menggunakan GEE Server-side Mapping (Tanpa Python Loop Sync).
    """
    init_gee()

    if isinstance(polygon_coordinates[0][0], (float, int)):
        coords_formatted = [polygon_coordinates]
    else:
        coords_formatted = polygon_coordinates

    raw_aoi = ee.Geometry.Polygon(coords_formatted, None, False)
    buffered_aoi = raw_aoi.buffer(-3)
    area_buffered = buffered_aoi.area(maxError=1).getInfo()
    aoi = buffered_aoi if area_buffered > 0 else raw_aoi

    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)

    # Filter Koleksi Citra
    dataset = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(raw_aoi)
        .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
        .sort('system:time_start', True)
    )

    # Fungsi internal GEE (dijalankan penuh di Server Google)
    def extract_time_series(image):
        # Apply Cloud Masking SCL
        scl = image.select('SCL')
        valid_mask = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).Or(scl.eq(7))
        cleaned = image.updateMask(valid_mask).divide(10000)
        
        # Hitung NDVI
        ndvi = cleaned.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Extract Median nilai NDVI di area AOI
        stats = ndvi.reduceRegion(
            reducer=ee.Reducer.median(),
            geometry=aoi,
            scale=10,
            bestEffort=True,
            maxPixels=1e9
        )
        
        date_str = image.date().format('YYYY-MM-dd')
        val = stats.get('NDVI')
        
        return ee.Feature(None, {
            'date': date_str,
            'ndvi': val
        })

    # Eksekusi Map secara paralel di server GEE
    features = dataset.map(extract_time_series).filter(ee.Filter.notNull(['ndvi'])).getInfo()

    # Format output untuk dikembalikan ke FastAPI
    time_series = []
    if 'features' in features:
        for feat in features['features']:
            props = feat['properties']
            if props.get('ndvi') is not None:
                time_series.append({
                    "date": props['date'],
                    "ndvi": round(props['ndvi'], 4)
                })

    return time_series


class MultiPolygonRequest(BaseModel):
    # Menerima list dari list koordinat poligon
    polygons: List[List[List[float]]] 
    start_date: Optional[str] = None
    end_date: Optional[str] = None

  
def get_all_lands_ndvi_map_tile(polygons_coordinates: list, start_date: str = None, end_date: str = None):
    init_gee()

    today = datetime.now()
    if not end_date:
        end_date = today.strftime('%Y-%m-%d')
    if not start_date:
        start_date = (today - timedelta(days=90)).strftime('%Y-%m-%d')

    # Buat FeatureCollection dari semua poligon lahan
    ee_polygons = [ee.Geometry.Polygon(coords, None, False) for coords in polygons_coordinates]
    combined_aoi = ee.FeatureCollection(ee_polygons)

    # Ambil Citra Sentinel-2 berdasar seluruh area lahan
    dataset = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(combined_aoi)
        .filterDate(start_date, end_date)
        .sort('system:time_start', False)
    )

    if dataset.size().getInfo() == 0:
        return None

    best_image = dataset.first()

    # Masking Awan
    scl = best_image.select('SCL')
    valid_mask = scl.eq(4).Or(scl.eq(5)).Or(scl.eq(6)).Or(scl.eq(7))
    cleaned = best_image.updateMask(valid_mask).divide(10000)

    # Hitung NDVI dan Clip LANGSUNG ke seluruh gabungan poligon lahan (combined_aoi)
    ndvi = cleaned.normalizedDifference(['B8', 'B4']).rename('NDVI').clip(combined_aoi)

    vis_params = {
        'min': 0.0,
        'max': 0.8,
        'palette': [
            'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', 
            '99B718', '74A901', '66A000', '529400', '3E8601', 
            '207401', '056201', '004C00'
        ]
    }

    map_id_dict = ndvi.getMapId(vis_params)

    return {
        "tile_url": map_id_dict['tile_fetcher'].url_format
    }