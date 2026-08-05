"use client";

import React, { useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Interface disesuaikan dengan data backend
interface BackendLandItem {
  land_id: number;
  name: string;
  farmer_name?: string;
  area: number;
  kebutuhan: string;
  center: [number, number]; // [lat, lng]
  polygon_coordinates: Array<[number, number]>; // [[lat, lng], [lat, lng], ...]
}

interface MapProps {
  geoData: BackendLandItem[] | any;
}

// Fungsi menentukan warna berdasarkan tingkat kebutuhan
const getKebutuhanColor = (kebutuhan: string) => {
  switch (kebutuhan?.toLowerCase()) {
    case "tinggi":
      return "#ef4444"; // Red
    case "sedang":
      return "#f59e0b"; // Amber
    case "rendah":
      return "#10b981"; // Emerald
    default:
      return "#3b82f6"; // Blue Default
  }
};

export default function MapDistribusiContent({ geoData }: MapProps) {
  const [activeLayer, setActiveLayer] = useState<"google" | "esri">("google");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Toggle Fullscreen Handler
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;

    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Gagal masuk mode fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error(`Gagal keluar mode fullscreen: ${err.message}`);
      });
    }
  };

  // Transformasi data Backend ke GeoJSON valid
  const formattedGeoJson = useMemo(() => {
    if (!geoData) return null;

    const items: BackendLandItem[] = Array.isArray(geoData)
      ? geoData
      : geoData.features || [];

    const features = items.map((item) => {
      if ((item as any).type === "Feature") return item;

      const formattedPolygon = item.polygon_coordinates.map(([lat, lng]) => [
        lng,
        lat,
      ]);

      if (
        formattedPolygon.length > 0 &&
        (formattedPolygon[0][0] !== formattedPolygon[formattedPolygon.length - 1][0] ||
          formattedPolygon[0][1] !== formattedPolygon[formattedPolygon.length - 1][1])
      ) {
        formattedPolygon.push(formattedPolygon[0]);
      }

      return {
        type: "Feature",
        properties: {
          land_id: item.land_id,
          name: item.name,
          farmer_name: item.farmer_name,
          area: item.area,
          kebutuhan: item.kebutuhan,
        },
        geometry: {
          type: "Polygon",
          coordinates: [formattedPolygon],
        },
      };
    });

    return {
      type: "FeatureCollection",
      features,
    };
  }, [geoData]);

  // Perhitungan Pusat Peta Otomatis
  const centerPosition = useMemo<[number, number]>(() => {
    if (!geoData) return [-7.7926255, 110.33180872];

    const items = Array.isArray(geoData) ? geoData : [];
    if (items.length === 0) return [-7.7926255, 110.33180872];

    let totalLat = 0;
    let totalLng = 0;

    items.forEach((item) => {
      if (item.center && item.center.length === 2) {
        totalLat += item.center[0];
        totalLng += item.center[1];
      }
    });

    return [totalLat / items.length, totalLng / items.length];
  }, [geoData]);

  // Style Polygon
  const stylePolygon = (feature: any) => {
    const color = getKebutuhanColor(feature?.properties?.kebutuhan);
    return {
      fillColor: color,
      weight: 2,
      opacity: 1,
      color: "#ffffff",
      dashArray: "3",
      fillOpacity: 0.6,
    };
  };

  // Tooltip & Popup Handler
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const { name, farmer_name, area, kebutuhan } = feature.properties || {};
    const color = getKebutuhanColor(kebutuhan);

    layer.bindTooltip(
      `<div class="text-xs font-semibold px-1 py-0.5">
        <p class="text-slate-900 font-extrabold">${name || "Lahan"}</p>
        <p class="text-slate-600 text-[10px]">Petani: <span class="font-bold">${farmer_name || "-"}</span></p>
      </div>`,
      { direction: "top", opacity: 1 }
    );

    layer.bindPopup(
      `<div class="p-1 min-w-[170px]">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detail Lahan</span>
        <h4 class="text-sm font-black text-slate-800 mt-0.5">${name || "-"}</h4>
        <div class="mt-2 space-y-1.5 border-t border-slate-100 pt-2 text-xs">
          <div class="flex justify-between">
            <span class="text-slate-500">Petani:</span>
            <span class="font-bold text-slate-700">${farmer_name || "-"}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Luas:</span>
            <span class="font-bold text-slate-700">${area} Ha</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-500">Kebutuhan:</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border" 
                  style="background-color: ${color}15; border-color: ${color}40; color: ${color};">
              ${kebutuhan}
            </span>
          </div>
        </div>
      </div>`
    );

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        if (l.setStyle) {
          l.setStyle({ fillOpacity: 0.85, weight: 3 });
        }
      },
      mouseout: (e) => {
        const l = e.target;
        if (l.setStyle) {
          l.setStyle({ fillOpacity: 0.6, weight: 2 });
        }
      },
    });
  };

  return (
    <div
      ref={mapContainerRef}
      className={`w-full relative overflow-hidden transition-all ${
        isFullscreen
          ? "h-screen rounded-none bg-black"
          : "h-full min-h-[420px] rounded-b-2xl"
      }`}
    >
      {/* CONTROL TOP-RIGHT (LAYER TOGGLE & FULLSCREEN BUTTON) */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        {/* BASELAYER TOGGLE */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md flex items-center gap-1">
          <button
            onClick={() => setActiveLayer("google")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLayer === "google"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Google Hybrid
          </button>
          <button
            onClick={() => setActiveLayer("esri")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeLayer === "esri"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Esri Imagery
          </button>
        </div>

        {/* FULLSCREEN BUTTON [ ] */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="bg-white/95 backdrop-blur-md p-2 rounded-xl border border-slate-200/80 shadow-md text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all flex items-center justify-center min-w-[36px] min-h-[36px]"
        >
          {isFullscreen ? (
            /* Icon Exit Fullscreen */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            /* Icon Enter Fullscreen [ ] */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" />
              <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* MAP CONTAINER */}
      <MapContainer
        center={centerPosition}
        zoom={17}
        scrollWheelZoom={true} // Zoom otomatis aktif saat scroll mouse di atas peta
        className="w-full h-full z-0"
        style={{ minHeight: isFullscreen ? "100vh" : "420px" }}
      >
        {activeLayer === "google" ? (
          <TileLayer
            attribution="&copy; Google Maps"
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={22}
          />
        ) : (
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={22}
          />
        )}

        {/* RENDER GEOJSON DARI HASIL TRANSFORMASI DATA */}
        {formattedGeoJson && (
          <GeoJSON
            key={JSON.stringify(formattedGeoJson)}
            data={formattedGeoJson as any}
            style={stylePolygon}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* LEGEND */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-md text-[11px] font-medium text-slate-600">
        <p className="font-bold text-slate-800 mb-1.5 text-[10px] uppercase tracking-wider">
          Tingkat Kebutuhan
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
            <span>Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
            <span>Sedang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span>Rendah</span>
          </div>
        </div>
      </div>
    </div>
  );
}