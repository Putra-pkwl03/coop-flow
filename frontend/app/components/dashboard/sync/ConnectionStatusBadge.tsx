"use client";

import React from "react";
import { FaWifi, FaExclamationTriangle } from "react-icons/fa";

interface Props {
  isOnline: boolean;
}

export default function ConnectionStatusBadge({ isOnline }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
        isOnline
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          : "bg-rose-50 text-rose-700 border border-rose-200/80 animate-pulse"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
      {isOnline ? (
        <>
          <FaWifi className="text-emerald-600 text-xs" /> Online
        </>
      ) : (
        <>
          <FaExclamationTriangle className="text-rose-600 text-xs" /> Offline
        </>
      )}
    </div>
  );
}