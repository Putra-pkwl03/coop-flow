"use client";

import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

interface Props {
  message: {
    type: "success" | "error" | "info";
    text: string;
  } | null;
  onClose: () => void;
}

export default function SyncMessageAlert({ message, onClose }: Props) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
    error: "bg-rose-50 text-rose-900 border-rose-200/80",
    info: "bg-sky-50 text-sky-900 border-sky-200/80",
  };

  const icons = {
    success: <FaCheckCircle className="text-emerald-600 text-lg flex-shrink-0" />,
    error: <FaExclamationTriangle className="text-rose-600 text-lg flex-shrink-0" />,
    info: <FaInfoCircle className="text-sky-600 text-lg flex-shrink-0" />,
  };

  return (
    <div
      className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between border shadow-xs transition-all ${styles[message.type]}`}
    >
      <div className="flex items-center gap-3">
        {icons[message.type]}
        <p className="leading-snug">{message.text}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-black/5 rounded-lg transition"
      >
        <FaTimes />
      </button>
    </div>
  );
}