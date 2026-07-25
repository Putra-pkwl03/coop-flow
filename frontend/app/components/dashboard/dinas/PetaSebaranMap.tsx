"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import seluruh elemen React Leaflet sekaligus
const LeafletMapInner = dynamic(
  async () => {
    const L = await import("leaflet");
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import(
      "react-leaflet"
    );

    // Sub-komponen internal untuk menangani kontrol Zoom & Reset Bounds
    const MapController = ({ bounds }: { bounds: any }) => {
      const map = useMap();

      useEffect(() => {
        if (bounds && bounds.isValid() && map) {
          map.fitBounds(bounds, { padding: [35, 35] });
        }
      }, [bounds, map]);

      return null;
    };

    // Sub-komponen tombol kustom di dalam Peta
    const CustomMapControls = ({
      bounds,
      isFullScreen,
      toggleFullScreen,
    }: {
      bounds: any;
      isFullScreen: boolean;
      toggleFullScreen: () => void;
    }) => {
      const map = useMap();

      const handleZoomIn = () => map.zoomIn();
      const handleZoomOut = () => map.zoomOut();
      const handleResetView = () => {
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35] });
        }
      };

      return (
        <>
          {/* Tombol Zoom & Reset View (Pojok Kiri Bawah) */}
          <div className="absolute bottom-4 left-4 z-[400] flex flex-col space-y-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-9 h-9 bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md flex items-center justify-center text-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 text-lg font-bold"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-9 h-9 bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md flex items-center justify-center text-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95 text-lg font-bold"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Fokuskan Ulang Peta"
              className="w-9 h-9 bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md flex items-center justify-center text-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>

          {/* Tombol Full Screen (Pojok Kanan Bawah) */}
          <div className="absolute bottom-4 right-4 z-[400]">
            <button
              type="button"
              onClick={toggleFullScreen}
              title={isFullScreen ? "Keluar Full Screen" : "Mode Layar Penuh"}
              className="px-3 py-2 bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-xl shadow-md flex items-center space-x-1.5 text-xs font-semibold text-zinc-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all active:scale-95"
            >
              {isFullScreen ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9L4 4m0 0l4 0m-4 0l0 4m11 5l5 5m0 0l-4 0m4 0l0-4M9 15l-5 5m0 0l4 0m-4 0l0-4m15-11l5-5m0 0l-4 0m4 0l0 4"
                    />
                  </svg>
                  <span>Keluar</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  <span>Layar Penuh</span>
                </>
              )}
            </button>
          </div>
        </>
      );
    };

    // Return komponen pembungkus internal
    return function InnerMap({
      defaultCenter,
      mapBounds,
      features,
      createCustomIcon,
      activeLayer,
      isFullScreen,
      toggleFullScreen,
    }: {
      defaultCenter: [number, number];
      mapBounds: any;
      features: any[];
      createCustomIcon: (L: any) => any;
      activeLayer: "light" | "satellite";
      isFullScreen: boolean;
      toggleFullScreen: () => void;
    }) {
      return (
        <MapContainer
          center={defaultCenter}
          zoom={11}
          zoomControl={false} // Matikan zoom control bawaan leaflet agar ganti yang kustom
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          {/* LAYER 1: Light Minimalist */}
          {activeLayer === "light" && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          )}

          {/* LAYER 2: Satellite Hybrid */}
          {activeLayer === "satellite" && (
            <>
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              />
            </>
          )}

          <MapController bounds={mapBounds} />

          <CustomMapControls
            bounds={mapBounds}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
          />

          {features.map((item) => {
            const [lng, lat] = item.geometry.coordinates;
            const { cooperative_id, name, address } = item.properties;

            return (
              <Marker
                key={cooperative_id}
                position={[lat, lng]}
                icon={createCustomIcon(L)}
              >
                <Popup>
                  <div className="p-2 max-w-[210px]">
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                        KUD
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        ID: #{cooperative_id}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-800 text-xs leading-snug">
                      {name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {address}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-xs text-zinc-400 font-medium">
        Memuat Peta Sebaran...
      </div>
    ),
  }
);

interface PetaSebaranProps {
  geoJsonData: {
    type: string;
    features: Array<{
      type: string;
      properties: {
        cooperative_id: number;
        name: string;
        address: string;
      };
      geometry: {
        type: string;
        coordinates: [number, number]; // [lng, lat]
      };
    }>;
  };
}

export default function PetaSebaranMap({ geoJsonData }: PetaSebaranProps) {
  const [L, setL] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<"light" | "satellite">("light");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const features = geoJsonData?.features || [];

  // Handle Full Screen Toggle dengan Browser API
  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch((err) => {
        console.error("Gagal membuka Full Screen mode:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      });
    }
  };

  // Deteksi jika user keluar dari Fullscreen dengan tombol ESC keyboard
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Load Leaflet instance
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  const defaultCenter: [number, number] = [-7.7713, 110.3002];

  // Generator Custom Pin Marker
  const createCustomIcon = (leafletInstance: any) => {
    const leafletObj = leafletInstance || L;
    if (!leafletObj) return undefined;

    return leafletObj.divIcon({
      className: "custom-map-pin",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
          <div class="relative inline-flex rounded-full h-7 w-7 bg-emerald-600 border-2 border-white shadow-lg items-center justify-center">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Kalkulasi area koordinat
  let mapBounds: any = null;
  if (L && features.length > 0) {
    mapBounds = L.latLngBounds(
      features.map((f) => [
        f.geometry.coordinates[1],
        f.geometry.coordinates[0],
      ])
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between transition-all ${
        isFullScreen ? "p-6 w-screen h-screen rounded-none" : "p-5 h-full min-h-[380px]"
      }`}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-800">
            Peta Sebaran Koperasi
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Sebaran titik lokasi KUD aktif terdaftar
          </p>
        </div>

        {/* Counter Badge */}
        <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-700">
            {features.length} KUD
          </span>
        </div>
      </div>

      {/* Kontainer Peta */}
      <div className="w-full flex-1 rounded-xl overflow-hidden border border-zinc-100 relative min-h-[280px]">
        {/* Switcher Layer Button (Pill Design) */}
        <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md p-1 rounded-xl border border-zinc-200/80 shadow-md flex items-center space-x-1 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveLayer("light")}
            className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
              activeLayer === "light"
                ? "bg-emerald-600 text-white font-semibold shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
            }`}
          >
            Vektor
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("satellite")}
            className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
              activeLayer === "satellite"
                ? "bg-emerald-600 text-white font-semibold shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
            }`}
          >
            Satelit
          </button>
        </div>

        {/* Global Styles for Leaflet */}
        <style jsx global>{`
          .leaflet-popup-content-wrapper {
            border-radius: 14px !important;
            padding: 4px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12) !important;
            border: 1px solid #f4f4f5 !important;
          }
          .leaflet-popup-tip {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12) !important;
          }
          .custom-map-pin {
            background: transparent !important;
            border: none !important;
          }
        `}</style>

        <LeafletMapInner
          defaultCenter={defaultCenter}
          mapBounds={mapBounds}
          features={features}
          createCustomIcon={createCustomIcon}
          activeLayer={activeLayer}
          isFullScreen={isFullScreen}
          toggleFullScreen={toggleFullScreen}
        />
      </div>
    </div>
  );
}