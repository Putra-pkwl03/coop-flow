// src/app/components/dashboard/kemenko/CooperativeDetailModal.tsx
"use client";

import React from "react";
import {
  FaTimes,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaFileAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaFilePdf,
  FaEye,
  FaCheck,
  FaBan,
} from "react-icons/fa";

// Interface untuk struktur data lengkap koperasi
export interface CooperativeDetailData {
  id: number;
  name: string;
  email: string;
  phone: string;
  nib: string;
  sk_number: string;
  established_date: string;
  npwp: string;
  capacity: string;
  status: "PENDING" | "ACTIVE" | "REJECTED"; // Ditambahkan REJECTED agar lebih aman
  document: {
    file_name: string;
    file_size: string;
    file_url: string;
  };
  location: {
    province: string;
    city: string;
    district: string;
    village: string;
    postal_code: string;
    full_address: string;
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CooperativeDetailData | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  actionLoading?: boolean;
}

export default function CooperativeDetailModal({
  isOpen,
  onClose,
  data,
  onApprove,
  onReject,
  actionLoading = false,
}: ModalProps) {
  if (!isOpen || !data) return null;

  // Helper Item Info (Menyerupai card-card kecil di referensi gambar)
  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50">
      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-zinc-900 mt-0.5">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FaBuilding size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Detail Koperasi
              </h2>
              <p className="text-sm text-zinc-500">
                Informasi lengkap data koperasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: Informasi Umum */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem
              icon={<FaBuilding />}
              label="Nama Koperasi"
              value={data.name}
            />
            <InfoItem icon={<FaEnvelope />} label="Email" value={data.email} />
            <InfoItem
              icon={<FaPhone />}
              label="No. Telepon"
              value={data.phone}
            />
            <InfoItem icon={<FaIdCard />} label="NIB" value={data.nib} />
            <InfoItem
              icon={<FaFileAlt />}
              label="No. SK"
              value={data.sk_number}
            />
            <InfoItem
              icon={<FaCalendarAlt />}
              label="Tgl Berdiri"
              value={data.established_date}
            />
            <InfoItem icon={<FaIdCard />} label="NPWP" value={data.npwp} />
            <InfoItem
              icon={<FaBoxOpen />}
              label="Kapasitas Gudang"
              value={`${data.capacity} Ton`}
            />
          </div>

          {/* SECTION 2: Berkas Dokumen */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
              <h3 className="text-sm font-bold text-zinc-800">
                Berkas (Legalitas/SK Pendirian)
              </h3>
            </div>
            <div className="p-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                  <FaFilePdf size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">
                    {data.document?.file_name || "Dokumen Legalitas.pdf"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {data.document?.file_size || "Unknown Size"} • PDF
                  </p>
                </div>
              </div>
              <a
                href={data.document?.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-sm transition-colors"
              >
                <FaEye /> Lihat Berkas
              </a>
            </div>
          </div>

          {/* SECTION 3: Lokasi */}
          <div>
            <h3 className="text-sm font-bold text-emerald-700 mb-3 px-1">
              Lokasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Provinsi"
                value={data.location.province}
              />
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Desa/Kelurahan"
                value={data.location.village}
              />
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Kabupaten/Kota"
                value={data.location.city}
              />
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Kode POS"
                value={data.location.postal_code}
              />
              <InfoItem
                icon={<FaMapMarkerAlt />}
                label="Kecamatan"
                value={data.location.district}
              />
            </div>
            <InfoItem
              icon={<FaMapMarkerAlt />}
              label="Alamat Lengkap"
              value={data.location.full_address}
            />
          </div>
        </div>

        {/* FOOTER & ACTIONS */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
          {data.status === "PENDING" ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-zinc-600 font-bold hover:bg-zinc-200 transition-colors text-sm"
              >
                Tutup
              </button>
              <button
                onClick={() => onReject && onReject(data.id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 bg-white hover:bg-red-50 font-bold text-sm transition-colors disabled:opacity-60"
              >
                <FaBan size={14} />
                Tolak Koperasi
              </button>
              <button
                onClick={() => onApprove && onApprove(data.id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-60"
              >
                <FaCheck size={14} />
                {actionLoading ? "Memproses..." : "Aktifkan Koperasi"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-zinc-50 transition-colors text-sm shadow-sm"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
