(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/dashboard/MapComponent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapComponent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'react-leaflet'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fi/index.mjs [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'leaflet/dist/leaflet.css'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module 'leaflet'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
// Fungsi pembantu untuk menghasilkan warna acak yang konsisten berdasarkan ID Petani
function getFarmerColor(farmerId) {
    const colors = [
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
        '#14b8a6',
        '#f97316',
        '#6366f1'
    ];
    return colors[farmerId % colors.length];
}
// Helper untuk mengambil titik tengah (Centroid) dari koordinat poligon
function getPolygonCenter(coords) {
    if (!coords || coords.length === 0) return [
        -7.7926,
        110.3325
    ];
    let latSum = 0;
    let lngSum = 0;
    coords.forEach(([lat, lng])=>{
        latSum += lat;
        lngSum += lng;
    });
    return [
        latSum / coords.length,
        lngSum / coords.length
    ];
}
// Helper auto-focus peta
function ChangeView({ bounds }) {
    _s();
    const map = useMap();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChangeView.useEffect": ()=>{
            if (bounds && bounds.length > 0) {
                map.fitBounds(bounds, {
                    padding: [
                        40,
                        40
                    ]
                });
            }
        }
    }["ChangeView.useEffect"], [
        bounds,
        map
    ]);
    return null;
}
_s(ChangeView, "IoceErwr5KVGS9kN4RQ1bOkYMAg=", false, function() {
    return [
        useMap
    ];
});
_c = ChangeView;
// Komponen Kontrol Gabungan (Zoom + Fullscreen) di Kanan Bawah
function CustomControls({ containerId }) {
    _s1();
    const map = useMap();
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleFullscreen = ()=>{
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(()=>setIsFullscreen(true)).catch(()=>{});
        } else {
            document.exitFullscreen().then(()=>setIsFullscreen(false));
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomControls.useEffect": ()=>{
            const handleFsChange = {
                "CustomControls.useEffect.handleFsChange": ()=>{
                    setIsFullscreen(!!document.fullscreenElement);
                    setTimeout({
                        "CustomControls.useEffect.handleFsChange": ()=>map.invalidateSize()
                    }["CustomControls.useEffect.handleFsChange"], 200);
                }
            }["CustomControls.useEffect.handleFsChange"];
            document.addEventListener('fullscreenchange', handleFsChange);
            return ({
                "CustomControls.useEffect": ()=>document.removeEventListener('fullscreenchange', handleFsChange)
            })["CustomControls.useEffect"];
        }
    }["CustomControls.useEffect"], [
        map
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-200 p-1 flex flex-col gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>map.zoomIn(),
                className: "w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition",
                title: "Zoom In",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiPlus"], {
                    className: "w-4 h-4 stroke-[2.5]"
                }, void 0, false, {
                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>map.zoomOut(),
                className: "w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition border-t border-zinc-100",
                title: "Zoom Out",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiMinus"], {
                    className: "w-4 h-4 stroke-[2.5]"
                }, void 0, false, {
                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: toggleFullscreen,
                className: "w-9 h-9 flex items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 active:scale-95 transition border-t border-zinc-100",
                title: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
                children: isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiMinimize2"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                    lineNumber: 127,
                    columnNumber: 25
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiMaximize2"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                    lineNumber: 127,
                    columnNumber: 63
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_s1(CustomControls, "SKRKY4UoGlDpH/mxrusshgxN7pM=", false, function() {
    return [
        useMap
    ];
});
_c1 = CustomControls;
function MapComponent({ farmers }) {
    _s2();
    const allBounds = [];
    const [activeLayer, setActiveLayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('esri');
    // Generator icon peta kustom dinamis memanfaatkan SVG `FiMapPin` bawaan lucide
    const createCustomIcon = (color)=>{
        return L.divIcon({
            html: `<div style="color: ${color}; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.3));" class="animate-bounce-short">
               <svg stroke="currentColor" fill="${color}25" stroke-width="2.5" viewBox="0 0 24 24" height="26" width="26" xmlns="http://www.w3.org/2000/svg">
                 <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                 <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
               </svg>
             </div>`,
            className: 'custom-map-pin',
            iconSize: [
                26,
                26
            ],
            iconAnchor: [
                13,
                26
            ],
            popupAnchor: [
                0,
                -24
            ]
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: "gis-map-wrapper",
        className: "w-full h-full relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MapContainer, {
                center: [
                    -7.7926,
                    110.3325
                ],
                zoom: 16,
                className: "w-full h-full",
                zoomControl: false,
                children: [
                    activeLayer === 'esri' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TileLayer, {
                        attribution: "© Esri",
                        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                        maxZoom: 22,
                        keepBuffer: 8,
                        updateWhenIdle: true
                    }, void 0, false, {
                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TileLayer, {
                        attribution: "© Google Maps Hybrid",
                        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                        maxZoom: 22,
                        keepBuffer: 8,
                        updateWhenIdle: true
                    }, void 0, false, {
                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                        lineNumber: 170,
                        columnNumber: 11
                    }, this),
                    farmers.map((farmer)=>{
                        // Ambil warna unik khusus untuk petani ini
                        const farmerColor = getFarmerColor(farmer.id);
                        return farmer.lands?.map((land)=>{
                            if (!land.polygon_coordinates || !Array.isArray(land.polygon_coordinates)) return null;
                            land.polygon_coordinates.forEach((coord)=>allBounds.push(coord));
                            const centerPoint = getPolygonCenter(land.polygon_coordinates);
                            // Template Popup
                            const popupContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-sans text-zinc-800 p-2 min-w-[220px] max-w-[260px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1.5 pb-2 border-b border-zinc-100 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "p-1 bg-zinc-50 rounded-lg",
                                                style: {
                                                    color: farmerColor
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiMapPin"], {
                                                    className: "w-3.5 h-3.5",
                                                    fill: "none"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                    lineNumber: 194,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                lineNumber: 193,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "font-bold text-sm text-zinc-900 m-0 leading-tight",
                                                children: land.land_name
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                lineNumber: 196,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                        lineNumber: 192,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1.5 text-xs text-zinc-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-zinc-400",
                                                        children: "Pemilik:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 57
                                                    }, this),
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-zinc-900",
                                                        children: farmer.user?.name || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 105
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                lineNumber: 199,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-zinc-400",
                                                        children: "Luas Lahan:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 200,
                                                        columnNumber: 57
                                                    }, this),
                                                    " ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-zinc-900 bg-zinc-50 px-1.5 py-0.2 rounded font-mono",
                                                        style: {
                                                            color: farmerColor
                                                        },
                                                        children: [
                                                            land.area,
                                                            " Ha"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 200,
                                                        columnNumber: 108
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                lineNumber: 200,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col pt-1 border-t border-zinc-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-zinc-400",
                                                        children: "Alamat Lokasi:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-zinc-700 italic mt-0.5 break-words line-clamp-2 leading-relaxed",
                                                        children: land.location_address || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                        lineNumber: 203,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                                lineNumber: 201,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                        lineNumber: 198,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                lineNumber: 191,
                                columnNumber: 15
                            }, this);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Polygon, {
                                        positions: land.polygon_coordinates,
                                        pathOptions: {
                                            color: farmerColor,
                                            fillColor: farmerColor,
                                            fillOpacity: 0.25,
                                            weight: 2.5,
                                            dashArray: '1'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Popup, {
                                            children: popupContent
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                            lineNumber: 222,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Marker, {
                                        position: centerPoint,
                                        icon: createCustomIcon(farmerColor),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Popup, {
                                            children: popupContent
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                            lineNumber: 230,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                        lineNumber: 226,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, land.id, true, {
                                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                                lineNumber: 210,
                                columnNumber: 15
                            }, this);
                        });
                    }),
                    allBounds.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChangeView, {
                        bounds: allBounds
                    }, void 0, false, {
                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                        lineNumber: 237,
                        columnNumber: 34
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomControls, {
                        containerId: "gis-map-wrapper"
                    }, void 0, false, {
                        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                lineNumber: 155,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 z-[400]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setActiveLayer(activeLayer === 'esri' ? 'google' : 'esri'),
                    className: "flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FiLayers"], {
                            className: "w-3.5 h-3.5 text-zinc-500"
                        }, void 0, false, {
                            fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                            lineNumber: 247,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: activeLayer === 'esri' ? 'Esri Satellite' : 'Google Hybrid'
                        }, void 0, false, {
                            fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                            lineNumber: 248,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                    lineNumber: 243,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/dashboard/MapComponent.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/dashboard/MapComponent.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
_s2(MapComponent, "2aY5z2/+jfSKwKASIVld796Mvi4=");
_c2 = MapComponent;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ChangeView");
__turbopack_context__.k.register(_c1, "CustomControls");
__turbopack_context__.k.register(_c2, "MapComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/dashboard/MapComponent.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/dashboard/MapComponent.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_components_dashboard_MapComponent_tsx_0bf0pau._.js.map