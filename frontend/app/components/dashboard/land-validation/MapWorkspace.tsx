'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FaTrash, FaPlus, FaExpand, FaCompress, FaLayerGroup, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2'; 

// Import fungsi service cuaca analitis
import { getHistoricalWeatherML } from '@/app/services/weatherService';
// Import komponen statistik iklim yang baru kita pisahkan di atas
import MacroClimateStats from './MacroClimateStats';

import 'leaflet/dist/leaflet.css';

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-zinc-400 text-xs font-medium bg-zinc-100">
      Memuat modul peta spasial...
    </div>
  ),
});

interface MapWorkspaceProps {
  onPolygonChange?: (coordinates: [number, number][]) => void;
  initialPolygon?: [number, number][]; 
  allFarmersData?: any[]; 
  selectedLandId?: string | number | null; 
  selectedLandData?: any; // 🌟 TAMBAHAN: Menerima data objek lahan utuh dari DB
  onSelectLandDirectly?: (farmer: any, land: any) => void; 
  activeTab?: 'belum' | 'sudah';
  onTriggerReMapping?: () => void;
  calculatedAreaText?: string; 
  onSave?: (payload: any) => void; 
  onCancel?: () => void;                
}

export default function MapWorkspace({ 
  onPolygonChange, 
  initialPolygon = [], 
  allFarmersData = [], 
  selectedLandId = null,
  selectedLandData = null, // 🌟 Di-set default null
  onSelectLandDirectly,
  activeTab = 'belum',
  onTriggerReMapping,
  calculatedAreaText = " ",
  onSave,
  onCancel
}: MapWorkspaceProps) {
  const [currentGPS, setCurrentGPS] = useState<[number, number]>([-7.72, 110.32]);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null); 
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<'esri' | 'google'>('esri');
  const [zoomAction, setZoomAction] = useState<{ type: 'in' | 'out' | null; id: number }>({ type: null, id: 0 });
  
  // State untuk menyimpan nilai cuaca makro
  const [macroClimate, setMacroClimate] = useState<{
    avgTemp: number | string;
    avgHumidity: number | string;
    avgRain: number | string;
  }>({ avgTemp: '--', avgHumidity: '--', avgRain: '--' });

  const workspaceRef = useRef<HTMLDivElement>(null);

  // Sync koordinat awal jika ada data passing-an
  useEffect(() => {
    if (initialPolygon && initialPolygon.length > 0) {
      setPolygonCoords(initialPolygon);
      setCurrentGPS(initialPolygon[0]);
    } else {
      setPolygonCoords([]);
    }
  }, [initialPolygon]);

  // 🌟 TAMBAHAN EFFECT: Sinkronisasi data iklim dari DB Backend ke UI
  useEffect(() => {
    if (activeTab === 'sudah' && selectedLandData) {
      const dbTemp = selectedLandData.average_temperature;
      const dbHumidity = selectedLandData.average_humidity;
      const dbRain = selectedLandData.average_monthly_precipitation;

      // Pasang nilai dari DB jika data tersedia (bukan null atau kosong)
      setMacroClimate({
        avgTemp: dbTemp !== null && dbTemp !== undefined ? Number(dbTemp) : '--',
        avgHumidity: dbHumidity !== null && dbHumidity !== undefined ? Number(dbHumidity) : '--',
        avgRain: dbRain !== null && dbRain !== undefined ? Number(dbRain) : '--'
      });
    } else if (activeTab === 'belum' && polygonCoords.length === 0) {
      // Reset ke standar jika masuk mode input kosong baru
      setMacroClimate({ avgTemp: '--', avgHumidity: '--', avgRain: '--' });
    }
  }, [selectedLandId, selectedLandData, activeTab]);

  useEffect(() => {
    if (initialPolygon && initialPolygon.length > 0) return;
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentGPS([latitude, longitude]);
        setGpsAccuracy(Math.round(accuracy));
      },
      (error) => console.error(error.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [initialPolygon]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleRecordPoint = () => {
    const updatedCoords = [...polygonCoords, currentGPS];
    setPolygonCoords(updatedCoords);
    if (onPolygonChange) onPolygonChange(updatedCoords);
  };

  const handleClearPolygon = () => {
    setPolygonCoords([]);
    setMacroClimate({ avgTemp: '--', avgHumidity: '--', avgRain: '--' });
    if (onPolygonChange) onPolygonChange([]);
  };

  const handleMapTap = (lat: number, lng: number) => {
    if (activeTab === 'sudah') return; 
    const updatedCoords: [number, number][] = [...polygonCoords, [lat, lng]];
    setPolygonCoords(updatedCoords);
    if (onPolygonChange) onPolygonChange(updatedCoords);
  };

  const handleResetAndRemap = () => {
    if (onTriggerReMapping) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
      }).fire({
        icon: 'info',
        title: 'Mode Gambar Ulang Aktif. Silakan plot simpul koordinat baru.'
      });
      setMacroClimate({ avgTemp: '--', avgHumidity: '--', avgRain: '--' });
      if (onPolygonChange) onPolygonChange([]); 
      onTriggerReMapping(); 
    }
  };

  const toggleFullscreen = () => {
    if (!workspaceRef.current) return;
    if (!document.fullscreenElement) {
      workspaceRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleSaveWorkspace = async () => {
    if (polygonCoords.length < 3) {
      Swal.fire('Aturan Validasi Spasial', 'Lahan wajib berbentuk poligon tertutup (minimal membutuhkan 3 titik koordinat)!', 'warning');
      return;
    }

    Swal.fire({
      title: 'Menganalisis Iklim Wilayah...',
      text: 'Mengumpulkan histori data cuaca 3 tahun dari Open-Meteo untuk standarisasi prediksi ML.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const [lat, lng] = polygonCoords[0]; 

    const climateResult = await getHistoricalWeatherML(lat, lng, 3);

    if (!climateResult) {
      Swal.fire('Koneksi Gagal', 'Gagal memproses data iklim makro wilayah pertanian.', 'error');
      return;
    }

    setMacroClimate({
      avgTemp: climateResult.avg_temperature,
      avgHumidity: climateResult.avg_humidity,
      avgRain: climateResult.avg_monthly_precipitation
    });

    Swal.close();

    const flatClimatePayload = {
      center_latitude: lat,
      center_longitude: lng,
      average_temperature: climateResult.avg_temperature,
      average_humidity: climateResult.avg_humidity,
      average_monthly_precipitation: climateResult.avg_monthly_precipitation,
    };

    if (onSave) {
      onSave(flatClimatePayload);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide px-2 pt-2">Lokasi dan Koordinat Lahan</h4>
      
      {/* PETA */}
      <div 
        ref={workspaceRef}
        className={`bg-white relative shadow-sm overflow-hidden border border-zinc-200 transition-all ${
          isFullscreen ? 'w-screen h-screen rounded-none' : 'rounded-2xl h-[350px]'
        }`}
      >
        <LeafletMapInner 
          currentGPS={currentGPS} 
          polygonCoords={polygonCoords} 
          onMapClick={handleMapTap}
          activeLayer={activeLayer}
          zoomAction={zoomAction} 
          isFullscreen={isFullscreen} 
          allFarmersData={allFarmersData}
          selectedLandId={selectedLandId}
          onSelectLandDirectly={onSelectLandDirectly}
          activeTab={activeTab} 
        />

        {/* Info GPS */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 text-zinc-700 p-3 rounded-xl text-[11px] font-bold space-y-1 backdrop-blur-sm border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${activeTab !== 'sudah' && 'animate-ping'}`}></div>
            <span>{activeTab === 'sudah' ? 'Viewer Mode' : `GPS: ±${gpsAccuracy || 0}m`}</span>
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            {currentGPS[0].toFixed(5)}, {currentGPS[1].toFixed(5)}
          </p>
        </div>

        {/* Kontrol Kanan */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
          <div className="bg-white/95 border border-zinc-200 p-1 rounded-xl flex flex-col gap-1 shadow-sm backdrop-blur-sm">
            <button type="button" onClick={() => setZoomAction(prev => ({ type: 'in', id: prev.id + 1 }))} className="w-6 h-6 flex items-center justify-center font-bold text-sm text-zinc-600 hover:bg-zinc-100 rounded-md transition">+</button>
            <button type="button" onClick={() => setZoomAction(prev => ({ type: 'out', id: prev.id + 1 }))} className="w-6 h-6 flex items-center justify-center font-bold text-sm text-zinc-600 hover:bg-zinc-100 rounded-md transition border-b border-zinc-100">-</button>
            <button type="button" onClick={() => setActiveLayer(prev => prev === 'esri' ? 'google' : 'esri')} className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"><FaLayerGroup size={10} /></button>
            <button type="button" onClick={toggleFullscreen} className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100">{isFullscreen ? <FaCompress size={10} /> : <FaExpand size={10} />}</button>
          </div>
        </div>

        {/* Tombol Aksi Melayang */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          {activeTab === 'belum' && (
            <div className="flex gap-2 justify-center max-w-xs mx-auto">
              <button type="button" onClick={handleRecordPoint} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition">
                <FaPlus size={10} /> Record ({polygonCoords.length})
              </button>
              {polygonCoords.length > 0 && (
                <button type="button" onClick={handleClearPolygon} className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2 rounded-lg shadow-md transition">
                  <FaTrash size={11} />
                </button>
              )}
            </div>
          )}
          {activeTab === 'sudah' && selectedLandId && polygonCoords.length > 0 && (
            <button type="button" onClick={handleResetAndRemap} className="mx-auto block bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold text-[11px] py-2 px-4 rounded-lg shadow-md transition border border-amber-400">
              <FaRedo className="inline mr-1 text-xs" /> Remap Area
            </button>
          )}
        </div>
      </div>

      {/* METRICS KOORDINAT */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-center">
          <p className="text-[10px] font-medium text-zinc-400">Luas Area</p>
          <p className="text-xs font-bold text-zinc-700">{calculatedAreaText} Ha</p>
        </div>
        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-center">
          <p className="text-[10px] font-medium text-zinc-400">Koordinat Titik</p>
          <p className="text-xs font-bold text-zinc-700">{polygonCoords.length} Titik</p>
        </div>
        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-center truncate">
          <p className="text-[10px] font-medium text-zinc-400">Titik Tengah</p>
          <p className="text-xs font-bold text-zinc-700 truncate">
            {polygonCoords.length > 0 ? `${polygonCoords[0][0].toFixed(4)}, ${polygonCoords[0][1].toFixed(4)}` : '-'}
          </p>
        </div>
      </div>

      {/* KAD STATISTIK IKLIM */}
      <MacroClimateStats 
        avgTemp={macroClimate.avgTemp}
        avgHumidity={macroClimate.avgHumidity}
        avgRain={macroClimate.avgRain}
      />

      {/* FOOTER BUTTONS */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 px-1">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 border border-zinc-200 text-zinc-600 hover:text-zinc-800 font-bold rounded-xl hover:bg-zinc-50 transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm bg-white"
        >
          <FaTimes className="text-zinc-400" />
          <span>Batal Validasi</span>
        </button>
        <button
          type="button"
          onClick={handleSaveWorkspace} 
          disabled={activeTab === 'belum' && polygonCoords.length < 3}
          className={`w-full py-2.5 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm ${
            activeTab === 'belum' && polygonCoords.length < 3
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
          }`}
        >
          <FaCheck />
          <span>Simpan Hasil Sinkronisasi</span>
        </button>
      </div>

    </div>
  );
}