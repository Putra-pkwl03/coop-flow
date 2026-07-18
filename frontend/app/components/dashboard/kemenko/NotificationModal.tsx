"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type ModalType = "success" | "error" | "confirm";

interface NotificationModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function NotificationModal({
  isOpen,
  type,
  title,
  description,
  confirmText = "OK",
  cancelText = "Batal",
  onConfirm,
  onCancel,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    success: (
      <CheckCircle2 className="w-16 h-16 text-[#0F7B4A]" strokeWidth={1.5} />
    ),
    error: <XCircle className="w-16 h-16 text-red-500" strokeWidth={1.5} />,
    confirm: (
      <AlertTriangle className="w-16 h-16 text-amber-500" strokeWidth={1.5} />
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-4 flex justify-center">{iconMap[type]}</div>

        <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}

        <div className="mt-6 flex gap-3">
          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition ${
              type === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#0F7B4A] hover:bg-[#0c6339]"
            }`}
          >
            {type === "confirm" ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
