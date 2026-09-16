'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, Marker } from 'react-leaflet';
import { FiPlus, FiMinus, FiMaximize2, FiMinimize2, FiLayers, FiMapPin, FiActivity, FiLoader, FiThermometer, FiDroplet, FiInfo } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Farmer } from '../../lib/db';
import api from '../../lib/axios';

interface MapComponentProps {
  farmers: Farmer[];
}

function getFarmerColor(farmerId: number | string): string {
  const numericId = typeof farmerId === 'number' ? farmerId : String(farmerId).length;
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', 
    '#f97316', '#6366f1'
  ];
  return colors[numericId % colors.length];
}

function getPolygonCenter(coords: [number, number][]): [number, number] {
  if (!coords || coords.length === 0) return [-7.7926, 110.3325];
  let latSum = 0;
  let lngSum = 0;
  coords.forEach(([lat, lng]) => {
    latSum += lat;
    lngSum += lng;
  });
  return [latSum / coords.length, lngSum / coords.length];
}

/**
 * Normalisasi koordinat agar selalu sesuai format Leaflet: [Latitude, Longitude]
 */
function normalizeToLeafletCoords(coords: [number, number][]): [number, number][] {
  if (!coords || !Array.isArray(coords)) return [];
  return coords.map(([first, second]) => {
    if (first > 50 && second < 20) {
      return [second, first]; // Tukar [Lng, Lat] menjadi [Lat, Lng]
    }
    return [first, second];
  });
}

/**
 * Helper untuk menentukan status kesehatan berdasarkan nilai NDVI
 */
function getNdviStatusInfo(ndvi?: number | null) {
  if (ndvi === undefined || ndvi === null) return { label: 'Belum dianalisis', color: 'text-zinc-400 bg-zinc-50' };
  if (ndvi < 0.3) return { label: 'Rendah / Kritis', color: 'text-[#CE7E45] bg-[#CE7E45]/10' };
  if (ndvi < 0.5) return { label: 'Sedang', color: 'text-[#F1B555] bg-[#F1B555]/10' };
  if (ndvi < 0.7) return { label: 'Sehat', color: 'text-[#74A901] bg-[#74A901]/10' };
  return { label: 'Sangat Subur', color: 'text-[#004C00] bg-[#004C00]/10' };
}

function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

function CustomControls({ containerId }: { containerId: string }) {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => map.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [map]);

  return (
    <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200 p-1 flex flex-col gap-1.5">
      <button 
        onClick={() => map.zoomIn()}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition"
        title="Zoom In"
      >
        <FiPlus className="w-4 h-4 stroke-[2.5]" />
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition border-t border-zinc-100"
        title="Zoom Out"
      >
        <FiMinus className="w-4 h-4 stroke-[2.5]" />
      </button>
      <button 
        onClick={toggleFullscreen}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition border-t border-zinc-100"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function MapComponent({ farmers }: MapComponentProps) {
  const allBounds: [number, number][] = [];
  const [activeLayer, setActiveLayer] = useState<'esri' | 'google'>('esri');
  
  // State NDVI Global
  const [showNdvi, setShowNdvi] = useState<boolean>(false);
  const [globalNdviTileUrl, setGlobalNdviTileUrl] = useState<string | null>(null);
  const [loadingNdvi, setLoadingNdvi] = useState<boolean>(false);

  // Fetch Tile URL Gabungan 1x untuk SELURUH Lahan saat mode NDVI diaktifkan
  useEffect(() => {
    if (showNdvi && !globalNdviTileUrl && !loadingNdvi) {
      setLoadingNdvi(true);
      api.get('/lands/all-ndvi-map-tile')
        .then((res) => {
          if (res.data && res.data.success && res.data.data?.tile_url) {
            setGlobalNdviTileUrl(res.data.data.tile_url);
          }
        })
        .catch((err) => {
          console.error('Gagal mengambil peta NDVI gabungan:', err);
        })
        .finally(() => {
          setLoadingNdvi(false);
        });
    }
  }, [showNdvi, globalNdviTileUrl, loadingNdvi]);

  return (
    <div id="gis-map-wrapper" className="w-full h-full relative">
      <MapContainer
        center={[-7.7926, 110.3325]} 
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* BASE MAP LAYER */}
        {activeLayer === 'esri' ? (
          <TileLayer
            attribution='&copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={22}
            keepBuffer={8} 
            updateWhenIdle={true} 
          />
        ) : (
          <TileLayer
            attribution='&copy; Google Maps Hybrid'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={22}
            keepBuffer={8} 
            updateWhenIdle={true}
          />
        )}

        {/* SINGLE TILE LAYER NDVI GABUNGAN */}
        {showNdvi && globalNdviTileUrl && (
          <TileLayer
            url={globalNdviTileUrl}
            maxZoom={22}
            opacity={0.85}
            zIndex={300}
          />
        )}

        {/* LOOP LAHAN & FARMER */}
        {farmers.map((farmer) => {
          const farmerColor = getFarmerColor(farmer.id);

          return farmer.lands?.map((land: any) => {
            if (!land.polygon_coordinates || !Array.isArray(land.polygon_coordinates)) return null;

            const leafletCoords = normalizeToLeafletCoords(land.polygon_coordinates);
            leafletCoords.forEach((coord) => allBounds.push(coord));
            
            const centerPoint = getPolygonCenter(leafletCoords);
            const ndviInfo = getNdviStatusInfo(land.current_ndvi);

            const popupContent = (
              <div className="font-sans text-zinc-800 p-2 min-w-64 max-w-72">
                {/* Header Lahan */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-2">
                  <span className="p-1 bg-zinc-50 rounded-lg" style={{ color: farmerColor }}>
                    <FiMapPin className="w-3.5 h-3.5" fill="none" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 m-0 leading-tight">{land.land_name}</h4>
                    <span className="text-[10px] text-zinc-500 font-medium">Status: {land.status || 'Milik Sendiri'}</span>
                  </div>
                </div>

                {/* Informasi Utama */}
                <div className="space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between"><span className="text-zinc-400">Pemilik:</span> <span className="font-semibold text-zinc-900">{farmer.name || farmer.user?.name || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Luas Lahan:</span> <span className="font-semibold text-zinc-900 bg-zinc-50 px-1.5 py-0.5 rounded font-mono" style={{ color: farmerColor }}>{land.area} {land.unit || 'Ha'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Jenis Tanah:</span> <span className="font-medium text-zinc-800">{land.soil_type || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Sumber Air:</span> <span className="font-medium text-zinc-800">{land.water_source || '-'} ({land.irrigation_type || '-'})</span></div>

                  {/* KELOMPOK INFORMASI NDVI & KLIMATOLOGI (DIAMBIL DARI DATABASE) */}
                  <div className="mt-2 pt-2 border-t border-zinc-100 bg-emerald-50/50 p-2 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <FiActivity className="w-3.5 h-3.5" /> Nilai NDVI:
                      </span>
                      <span className="font-mono font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {land.current_ndvi !== null && land.current_ndvi !== undefined ? Number(land.current_ndvi).toFixed(4) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500">Kesehatan Tanaman:</span>
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${ndviInfo.color}`}>
                        {ndviInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Data Suhu & Curah Hujan */}
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                    <div className="bg-zinc-50 p-1.5 rounded-lg flex items-center gap-1.5">
                      <FiThermometer className="w-3.5 h-3.5 text-amber-500" />
                      <div>
                        <span className="text-zinc-400 block text-[9px]">Suhu Rata2</span>
                        <span className="font-semibold text-zinc-800">{land.average_temperature ? `${land.average_temperature}°C` : '-'}</span>
                      </div>
                    </div>
                    <div className="bg-zinc-50 p-1.5 rounded-lg flex items-center gap-1.5">
                      <FiDroplet className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <span className="text-zinc-400 block text-[9px]">Curah Hujan</span>
                        <span className="font-semibold text-zinc-800">{land.average_monthly_precipitation ? `${land.average_monthly_precipitation} mm` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="flex flex-col pt-1 border-t border-zinc-50">
                    <span className="text-zinc-400">Alamat Lokasi:</span>
                    <span className="text-zinc-700 italic mt-0.5 leading-relaxed">{land.location_address || 'Yogyakarta'}</span>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={land.id}>
                {/* LAYER POLIGON BORDER */}
                <Polygon
                  positions={leafletCoords}
                  pathOptions={{
                    color: showNdvi ? '#ffffff' : farmerColor,      
                    fillColor: farmerColor,
                    fill: !showNdvi, // Matikan background poligon saat mode NDVI aktif agar citra satelit terlihat
                    fillOpacity: showNdvi ? 0 : 0.25,
                    weight: showNdvi ? 2 : 2.5,
                    dashArray: showNdvi ? '4' : undefined
                  }}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>

                {/* MARKER LOKASI */}
                <Marker
                  position={centerPoint}
                  icon={L.divIcon({
                    html: `<div style="color: ${farmerColor}; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.3));" class="animate-bounce-short">
                             <svg stroke="currentColor" fill="${farmerColor}25" stroke-width="2.5" viewBox="0 0 24 24" height="26" width="26" xmlns="http://www.w3.org/2000/svg">
                               <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                               <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
                             </svg>
                           </div>`,
                    className: 'custom-map-pin',
                    iconSize: [26, 26],
                    iconAnchor: [13, 26],
                    popupAnchor: [0, -24]
                  })}
                >
                  <Popup>{popupContent}</Popup>
                </Marker>
              </div>
            );
          });
        })}

        {allBounds.length > 0 && <ChangeView bounds={allBounds} />}
        <CustomControls containerId="gis-map-wrapper" />
      </MapContainer>

      {/* PANEL TOMBOL DOKING DI KIRI BAWAH */}
      <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2">
        {/* Tombol Ganti Satelit */}
        <button
          onClick={() => setActiveLayer(activeLayer === 'esri' ? 'google' : 'esri')}
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
        >
          <FiLayers className="w-3.5 h-3.5 text-zinc-500" />
          <span>{activeLayer === 'esri' ? 'Esri' : 'Google'}</span>
        </button>

        {/* TOMBOL TOGGLE MODE NDVI */}
        <button
          onClick={() => setShowNdvi(!showNdvi)}
          disabled={loadingNdvi}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl shadow-xl border text-xs font-bold transition active:scale-95 ${
            showNdvi 
              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-300 ring-offset-1' 
              : 'bg-white/95 backdrop-blur-md text-zinc-700 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          {loadingNdvi ? (
            <FiLoader className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <FiActivity className={`w-3.5 h-3.5 ${showNdvi ? 'text-white' : 'text-emerald-600'}`} />
          )}
          <span>{loadingNdvi ? 'Memuat Satelit...' : showNdvi ? 'Mode NDVI (Aktif)' : 'Analisis NDVI'}</span>
        </button>
      </div>

      {/* LEGENDA WARNA NDVI */}
      {showNdvi && (
        <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-zinc-200 text-[10px] font-semibold text-zinc-700 flex items-center gap-2">
          <span className="text-zinc-500">Kesehatan:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#CE7E45]" title="Rendah/Kritis" />
            <span className="w-3 h-3 rounded bg-[#F1B555]" title="Sedang" />
            <span className="w-3 h-3 rounded bg-[#74A901]" title="Sehat" />
            <span className="w-3 h-3 rounded bg-[#004C00]" title="Sangat Subur" />
          </div>
        </div>
      )}
    </div>
  );
}