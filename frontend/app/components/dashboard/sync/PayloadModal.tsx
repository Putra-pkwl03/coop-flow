"use client";

import React from "react";
import { FaDatabase, FaTimes } from "react-icons/fa";

interface Props {
  payload: Record<string, any> | null;
  onClose: () => void;
}

export default function PayloadModal({ payload, onClose }: Props) {
  if (!payload) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FaDatabase className="text-emerald-600" /> Detail Payload Data Offline
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto bg-slate-900 text-emerald-400 font-mono text-xs">
          <pre className="whitespace-pre-wrap break-all leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}