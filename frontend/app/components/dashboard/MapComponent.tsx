'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, Marker } from 'react-leaflet';
import { FiPlus, FiMinus, FiMaximize2, FiMinimize2, FiLayers, FiMapPin } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Import tipe Farmer langsung dari db.ts (Hapus interface lokal)
import { Farmer } from '../../lib/db';

interface MapComponentProps {
  farmers: Farmer[];
}

// Fungsi pembantu untuk menghasilkan warna acak yang konsisten berdasarkan ID Petani
function getFarmerColor(farmerId: number | string): string {
  const numericId = typeof farmerId === 'number' ? farmerId : String(farmerId).length;
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', 
    '#f97316', '#6366f1'
  ];
  return colors[numericId % colors.length];
}

// Helper untuk mengambil titik tengah (Centroid) dari koordinat poligon
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

// Helper auto-focus peta
function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

// Komponen Kontrol Gabungan (Zoom + Fullscreen) di Kanan Bawah
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

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      html: `<div style="color: ${color}; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.3));" class="animate-bounce-short">
               <svg stroke="currentColor" fill="${color}25" stroke-width="2.5" viewBox="0 0 24 24" height="26" width="26" xmlns="http://www.w3.org/2000/svg">
                 <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                 <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
               </svg>
             </div>`,
      className: 'custom-map-pin',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -24]
    });
  };

  return (
    <div id="gis-map-wrapper" className="w-full h-full relative">
      <MapContainer
        center={[-7.7926, 110.3325]} 
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
      >
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

        {farmers.map((farmer) => {
          const farmerColor = getFarmerColor(farmer.id);

          return farmer.lands?.map((land) => {
            if (!land.polygon_coordinates || !Array.isArray(land.polygon_coordinates)) return null;

            land.polygon_coordinates.forEach((coord: [number, number]) => allBounds.push(coord));
            const centerPoint = getPolygonCenter(land.polygon_coordinates);

            const popupContent = (
              <div className="font-sans text-zinc-800 p-2 min-w-55 max-w-65">
                <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-2">
                  <span className="p-1 bg-zinc-50 rounded-lg" style={{ color: farmerColor }}>
                    <FiMapPin className="w-3.5 h-3.5" fill="none" />
                  </span>
                  <h4 className="font-bold text-sm text-zinc-900 m-0 leading-tight">{land.land_name}</h4>
                </div>
                <div className="space-y-1.5 text-xs text-zinc-600">
                  <div className="flex justify-between"><span className="text-zinc-400">Pemilik:</span> <span className="font-semibold text-zinc-900">{farmer.name || farmer.user?.name || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Luas Lahan:</span> <span className="font-semibold text-zinc-900 bg-zinc-50 px-1.5 py-0.2 rounded font-mono" style={{ color: farmerColor }}>{land.area} Ha</span></div>
                  <div className="flex flex-col pt-1 border-t border-zinc-50">
                    <span className="text-zinc-400">Alamat Lokasi:</span>
                    <span className="text-zinc-700 italic mt-0.5 wrap-break-word line-clamp-2 leading-relaxed">{land.location_address || '-'}</span>
                  </div>
                </div>
              </div>
            );

            return (
              <div key={land.id}>
                <Polygon
                  positions={land.polygon_coordinates}
                  pathOptions={{
                    color: farmerColor,      
                    fillColor: farmerColor,   
                    fillOpacity: 0.25,
                    weight: 2.5,
                    dashArray: '1'
                  }}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>

                <Marker
                  position={centerPoint}
                  icon={createCustomIcon(farmerColor)}
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

      <div className="absolute bottom-4 left-4 z-[400]">
        <button
          onClick={() => setActiveLayer(activeLayer === 'esri' ? 'google' : 'esri')}
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
        >
          <FiLayers className="w-3.5 h-3.5 text-zinc-500" />
          <span>{activeLayer === 'esri' ? 'Esri Satellite' : 'Google Hybrid'}</span>
        </button>
      </div>
    </div>
  );
}