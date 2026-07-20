"use client";

import React from "react";
import { 
  FaFileAlt, FaCheckCircle, FaShieldAlt, 
  FaTruck, FaMapMarkerAlt, FaCheck, FaExclamationTriangle 
} from "react-icons/fa";

interface StepperProps {
  statusVerifikasi: string;
  statusLogistik: string;
  createdAt: string;
  dispatchedAt: string | null;
  dinasReceivedAt: string | null;
  completedAt: string | null;
}

export default function DetailStepper({
  statusVerifikasi,
  statusLogistik,
  createdAt,
  dispatchedAt,
  dinasReceivedAt,
  completedAt,
}: StepperProps) {
  
  // Format Tanggal Dinamis
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Konfigurasi langkah pelacakan horizontal yang diselaraskan dengan data dinamis
  const trackingSteps = [
    { 
      title: "Pengajuan", 
      desc: "Koperasi", 
      isDone: true, 
      date: formatDate(createdAt),
      icon: FaFileAlt,
    },
    { 
      title: "Verifikasi Dinas", 
      desc: statusVerifikasi === "REJECTED_DINAS" ? "Ditolak" : "Disetujui", 
      isDone: ["PENDING_KEMENKO", "APPROVED", "REJECTED_KEMENKO"].includes(statusVerifikasi) || statusLogistik !== "NONE",
      isRejected: statusVerifikasi === "REJECTED_DINAS",
      date: ["PENDING_KEMENKO", "APPROVED", "REJECTED_KEMENKO"].includes(statusVerifikasi) || statusLogistik !== "NONE" ? formatDate(dispatchedAt || new Date().toISOString()) : null,
      icon: FaCheckCircle,
    },
    { 
      title: "Kuota Kemenko", 
      desc: statusVerifikasi === "REJECTED_KEMENKO" ? "Ditolak" : "Disetujui", 
      isDone: statusVerifikasi === "APPROVED" || statusLogistik !== "NONE",
      isRejected: statusVerifikasi === "REJECTED_KEMENKO",
      date: statusVerifikasi === "APPROVED" || statusLogistik !== "NONE" ? formatDate(dispatchedAt) : null,
      icon: FaShieldAlt,
    },
    { 
      title: "Rilis Armada", 
      desc: statusLogistik === "PROD_LINI_1_2" ? "Lini 1-2" : "Diproses", 
      isDone: ["PROD_LINI_1_2", "GUDANG_LINI_3", "SIAP_TEBUS_LINI_4", "SELESAI"].includes(statusLogistik),
      date: ["PROD_LINI_1_2", "GUDANG_LINI_3", "SIAP_TEBUS_LINI_4", "SELESAI"].includes(statusLogistik) ? formatDate(dispatchedAt) : null,
      icon: FaTruck,
    },
    { 
      title: "Tiba Lini 3 & 4", 
      desc: statusLogistik === "SIAP_TEBUS_LINI_4" ? "Siap Tebas" : "Bongkar Muat", 
      isDone: ["GUDANG_LINI_3", "SIAP_TEBUS_LINI_4", "SELESAI"].includes(statusLogistik),
      date: ["GUDANG_LINI_3", "SIAP_TEBUS_LINI_4", "SELESAI"].includes(statusLogistik) ? formatDate(dinasReceivedAt) : null,
      icon: FaMapMarkerAlt,
    },
    { 
      title: "Selesai", 
      desc: "Masuk Gudang", 
      isDone: statusLogistik === "SELESAI", 
      date: formatDate(completedAt),
      icon: FaCheck,
    }
  ];

  // Mencari index langkah yang sedang berjalan saat ini
  const currentActiveStepIndex = trackingSteps.findIndex(s => !s.isDone && !s.isRejected);

  return (
    <div className="border border-zinc-100 rounded-2xl bg-white p-6 space-y-6 shadow-sm">
      
      {/* Stepper Flow Horizontal Modern */}
      <div className="w-full py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-start justify-between px-2 w-full relative min-w-3xl md:min-w-0">
          
          {trackingSteps.map((step, idx) => {
            const Icon = step.icon;
            
            // Penentuan State Lingkaran & Garis
            let circleStyles = "text-zinc-400 bg-zinc-50 border-zinc-200";
            let isLineActive = false;
            let isProcessing = false;

            if (step.isRejected) {
              circleStyles = "text-red-600 bg-red-50 border-red-200 shadow-sm shadow-red-100";
            } else if (step.isDone) {
              circleStyles = "text-emerald-600 bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100";
              isLineActive = true;
            } else if (idx === currentActiveStepIndex) {
              circleStyles = "text-teal-700 bg-white border-teal-600 shadow-lg shadow-teal-100 font-semibold";
              isProcessing = true;
            }

            return (
              <div key={idx} className="flex flex-col items-center text-center relative flex-1">
                
                {/* KONSTRUKSI GARIS MODERN */}
                {idx < trackingSteps.length - 1 && (
                  <div className="absolute top-5 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-0.5 flex items-center z-0">
                    <svg className="w-full h-full" pointerEvents="none">
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={isLineActive ? "#10b981" : "#e4e4e7"}
                        strokeWidth="2"
                        strokeDasharray={isLineActive ? "0" : "4 4"}
                        className="transition-all duration-500"
                      />
                    </svg>
                  </div>
                )}

                {/* Container Bulatan Ikon dengan Efek Loading */}
                <div className="relative w-10 h-10 flex items-center justify-center z-10">
                  
                  {/* Efek Loading Putar Terus Menerus */}
                  {isProcessing && (
                    <div 
                      className="absolute inset-0 rounded-xl border-2 border-dashed border-teal-400 animate-spin" 
                      style={{ animationDuration: "3s" }}
                    />
                  )}

                  {/* Bulatan Ikon Utama berbentuk Kotak Miring Modern (rounded-xl) */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 bg-white relative z-10 ${circleStyles}`}>
                    {step.isRejected ? (
                      <FaExclamationTriangle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Label Teks dan Penanggalan Dinamis */}
                <div className="mt-4 space-y-1 max-w-30 relative z-10">
                  <p className={`text-xs font-semibold tracking-tight ${step.isRejected ? "text-red-600" : step.isDone ? "text-zinc-800" : isProcessing ? "text-teal-800 font-bold" : "text-zinc-400"}`}>
                    {step.title}
                  </p>
                  
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      step.isRejected ? "bg-red-50 text-red-700" : step.isDone ? "bg-emerald-50 text-emerald-700" : isProcessing ? "bg-teal-50 text-teal-700 font-bold" : "bg-zinc-100 text-zinc-400"
                    }`}>
                      {step.desc}
                    </span>
                    {step.date && (
                      <span className="text-[9px] text-zinc-400 font-medium mt-0.5">
                        {step.date}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}