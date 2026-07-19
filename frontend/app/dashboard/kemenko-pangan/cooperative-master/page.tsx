"use client";

import React, { useState, useEffect } from "react";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
// Import Komponen Presentasional Global
import MetricCards from "@/app/components/dashboard/kemenko/MetricCards";
import FilterBar from "@/app/components/dashboard/kemenko/FilterBar";
import CooperativeTable from "@/app/components/dashboard/kemenko/CooperativeTable";
import NotificationModal from "@/app/components/dashboard/kemenko/NotificationModal";

// IMPORT KOMPONEN MODAL DETAIL BARU KITA
import CooperativeDetailModal, {
  CooperativeDetailData,
} from "@/app/components/dashboard/kemenko/CooperativeDetailModal";

// Definisikan struktur data agar pas dengan properti tabel visual yang baru
interface CooperativeViewData {
  id: number;
  name: string;
  legal_entity_type: string;
  province: string;
  city_koor: string;
  status: string;
  created_at?: string;
}

interface ModalState {
  isOpen: boolean;
  type: "success" | "error" | "confirm";
  title: string;
  description?: string;
  onConfirm: () => void;
}

export default function CooperativeMasterPage() {
  const router = useRouter();

  const [cooperatives, setCooperatives] = useState<CooperativeViewData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State untuk modal notifikasi/konfirmasi custom
  const [modal, setModal] = useState<ModalState | null>(null);
  const closeModal = () => setModal(null);

  // === STATE BARU UNTUK MODAL DETAIL KOPERASI ===
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedCoopDetail, setSelectedCoopDetail] =
    useState<CooperativeDetailData | null>(null);

  const fetchCooperatives = async () => {
    setLoading(true);
    try {
      const [responsePending, responseActive] = await Promise.all([
        api.get("/kemenko/registrations/pending"),
        api.get("/kemenko/registrations/active"),
      ]);

      let combinedData: CooperativeViewData[] = [];

      if (responsePending.data.success) {
        const pendingItems = responsePending.data.data.map((user: any) => ({
          id: user.id,
          name: user.cooperative?.name || user.name || "-",
          legal_entity_type:
            user.cooperative?.legal_entity_type || "Koperasi Produsen",
          province: user.cooperative?.province || "-",
          city_koor: user.cooperative?.city_koor || "-",
          status: "PENDING",
          created_at: user.created_at,
        }));
        combinedData = [...combinedData, ...pendingItems];
      }

      if (responseActive.data.success) {
        const activeItems = responseActive.data.data.map((user: any) => ({
          id: user.id,
          name: user.cooperative?.name || user.name || "-",
          legal_entity_type:
            user.cooperative?.legal_entity_type || "Koperasi Produsen",
          province: user.cooperative?.province || "-",
          city_koor: user.cooperative?.city_koor || "-",
          status: "ACTIVE",
          created_at: user.created_at,
        }));
        combinedData = [...combinedData, ...activeItems];
      }

      setCooperatives(combinedData);
    } catch (error) {
      console.error("Gagal mengambil data master koperasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCooperatives();
  }, []);

  const totalCoops = cooperatives.length;
  const activeCoops = cooperatives.filter((c) => c.status === "ACTIVE").length;
  const inactiveCoops = cooperatives.filter(
    (c) => c.status === "PENDING",
  ).length;
  const newThisMonth = cooperatives.filter((c) => {
    if (!c.created_at) return false;
    const date = new Date(c.created_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const handleViewDetail = async (userId: number) => {
    setActionLoading(userId);
    try {
      const response = await api.get(`/kemenko/registrations/${userId}`);
      if (response.data.success) {
        const data = response.data.data;

        const detailData: CooperativeDetailData = {
          id: data.id,
          name: data.cooperative?.name || data.name || "-",
          email: data.email || "-",
          phone: data.phone || data.cooperative?.phone_cooperative || "-",
          nib: data.cooperative?.nib_cooperative || "-",
          sk_number: data.cooperative?.legal_approval_number || "-",
          established_date: data.cooperative?.established_date || "-",
          npwp: data.cooperative?.npwp || "-",
          capacity: data.cooperative?.warehouse_capacity_ton || "0",
          status: data.status || "PENDING",
          document: {
            file_name:
              data.cooperative?.legal_approval_document?.split("/").pop() ||
              "Dokumen_Koperasi.pdf",
            file_size: "File Terlampir",
            file_url: data.cooperative?.legal_approval_document || "#",
          },
          location: {
            province: data.cooperative?.province || "-",
            city: data.cooperative?.city_koor || "-",
            district: data.cooperative?.district || "-",
            village: data.cooperative?.village || "-",
            postal_code: data.cooperative?.postal_code || "-",
            full_address: data.cooperative?.address || "-",
          },
        };

        setSelectedCoopDetail(detailData);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Gagal mengambil detail koperasi:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Gagal Memuat Detail",
        description: "Terjadi kesalahan saat mengambil data lengkap koperasi.",
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateFromDetail = (userId: number) => {
    setIsDetailModalOpen(false); // Tutup modal detail terlebih dahulu
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Aktifkan Koperasi?",
      description:
        "Apakah Anda yakin ingin menyetujui dan mengaktifkan koperasi ini berdasarkan dokumen yang telah diperiksa?",
      onConfirm: () => confirmActivateCooperative(userId),
    });
  };

  // Step 1 (Tolak dari Modal Detail): Tutup modal detail, buka modal konfirmasi penolakan
  const handleRejectFromDetail = (userId: number) => {
    setIsDetailModalOpen(false);
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Tolak Koperasi?",
      description:
        "Apakah Anda yakin ingin menolak koperasi ini? Akun mereka tidak akan diaktifkan.",
      onConfirm: () => confirmRejectCooperative(userId),
    });
  };

  // Step 2: Eksekusi Aktivasi
  const confirmActivateCooperative = async (userId: number) => {
    closeModal();
    setActionLoading(userId);
    try {
      const response = await api.post(
        `/kemenko/registrations/${userId}/approve`,
      );
      if (response.data.success) {
        setModal({
          isOpen: true,
          type: "success",
          title: "Berhasil Disetujui",
          description: "Koperasi berhasil diaktifkan.",
          onConfirm: closeModal,
        });
        fetchCooperatives();
      }
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Gagal Mengaktifkan",
        description:
          error.response?.data?.message || "Gagal mengaktifkan koperasi.",
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Step 2: Eksekusi Penolakan (Fungsi Baru)
  const confirmRejectCooperative = async (userId: number) => {
    closeModal();
    setActionLoading(userId);
    try {
      const response = await api.post(
        `/kemenko/registrations/${userId}/reject`,
      ); // Pastikan API ini tersedia di backend
      if (response.data.success) {
        setModal({
          isOpen: true,
          type: "success",
          title: "Berhasil Ditolak",
          description: "Pendaftaran koperasi telah ditolak.",
          onConfirm: closeModal,
        });
        fetchCooperatives(); // Refresh Data
      }
    } catch (error: any) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Gagal Menolak",
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menolak pendaftaran.",
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    fetchCooperatives();
  };

  const filteredData = cooperatives.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.legal_entity_type.toLowerCase().includes(search.toLowerCase()) ||
      item.province.toLowerCase().includes(search.toLowerCase()) ||
      item.city_koor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.status === "ACTIVE") ||
      (statusFilter === "inactive" && item.status === "PENDING");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors shrink-0"
          >
            <HiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F7B4A] tracking-tight">
              Cooperative Master
            </h1>
            <p className="text-sm text-zinc-500">
              Kelola dan pantau seluruh data master koperasi terdaftar di sistem
              pusat nasional.
            </p>
          </div>
        </div>
      </div>

      <MetricCards
        total={totalCoops}
        active={activeCoops}
        inactive={inactiveCoops}
        newThisMonth={newThisMonth}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* UPDATE DISINI: Mengganti onActivate menjadi onViewDetail */}
      <CooperativeTable
        data={filteredData}
        loading={loading}
        actionLoading={actionLoading}
        onViewDetail={handleViewDetail}
      />

      {/* RENDER MODAL DETAIL KOPERASI */}
      <CooperativeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedCoopDetail}
        onApprove={handleActivateFromDetail}
        onReject={handleRejectFromDetail}
        actionLoading={!!actionLoading}
      />

      {/* Modal notifikasi/konfirmasi custom */}
      {modal && (
        <NotificationModal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          description={modal.description}
          onConfirm={modal.onConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
