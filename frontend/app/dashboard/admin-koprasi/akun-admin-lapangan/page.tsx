"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FieldAdmin,
  CreateFieldAdminPayload,
  UpdateFieldAdminPayload,
} from "../../../types/fieldAdmin";
import { FieldAdminService } from "../../../services/fieldAdminService";
import {
  HiUserGroup,
  HiCheckBadge,
  HiClock,
  HiXCircle,
  HiMagnifyingGlass,
  HiFunnel,
  HiPlus,
} from "react-icons/hi2";

// Import komponen yang sudah dipisah sesuai struktur folder
import FieldAdminTable from "@/app/components/dashboard/admin-koperasi/akun-admin-lapangan/FieldAdminTable";
import FieldAdminModal from "@/app/components/dashboard/admin-koperasi/akun-admin-lapangan/FieldAdminModal";

const PAGE_SIZE = 6;

type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "REJECTED";

const STATUS_LABEL: Record<FieldAdmin["status"], string> = {
  ACTIVE: "Aktif",
  PENDING: "Pending",
  REJECTED: "Ditolak",
};

export default function FieldAdminPage() {
  const [admins, setAdmins] = useState<FieldAdmin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<FieldAdmin | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await FieldAdminService.getAll();
      setAdmins(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      await FieldAdminService.toggleStatus(id);
      fetchData();
    } catch (error) {
      alert("Gagal mengubah status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus admin lapangan ini?")) return;
    try {
      await FieldAdminService.delete(id);
      fetchData();
    } catch (error) {
      alert("Gagal menghapus data");
    }
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setShowModal(true);
  };

  const openEditModal = (admin: FieldAdmin) => {
    setEditingAdmin(admin);
    setShowModal(true);
  };

  const handleSave = async (
    payload: CreateFieldAdminPayload | UpdateFieldAdminPayload,
  ) => {
    try {
      setSaving(true);
      if (editingAdmin) {
        await FieldAdminService.update(
          editingAdmin.id,
          payload as UpdateFieldAdminPayload,
        );
      } else {
        await FieldAdminService.create(payload as CreateFieldAdminPayload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data. Periksa kembali isian Anda.");
    } finally {
      setSaving(false);
    }
  };

  // --- Stat cards ---
  const total = admins.length;
  const activeCount = admins.filter((a) => a.status === "ACTIVE").length;
  const pendingCount = admins.filter((a) => a.status === "PENDING").length;
  const rejectedCount = admins.filter((a) => a.status === "REJECTED").length;

  // --- Filter + search ---
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phone ?? "").includes(search);
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [admins, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const paginatedAdmins = filteredAdmins.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="bg-gray-50 -mt-2.5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F7B4A]">Admin Lapangan</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola data admin lapangan yang bertugas di wilayah operasional
            koperasi.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#0F7B4A] hover:bg-[#0c6a40] text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <HiPlus className="text-lg" />
          Tambah Admin Lapangan
        </button>
      </div>

      {/* Stat Cards - Dipertahankan di halaman agar kalkulasi status cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<HiUserGroup className="text-2xl text-[#0F7B4A]" />}
          iconBg="bg-[#E4F5EC]"
          label="Total Admin Lapangan"
          value={total}
          unit="Orang"
        />
        <StatCard
          icon={<HiCheckBadge className="text-2xl text-blue-500" />}
          iconBg="bg-blue-50"
          label="Aktif"
          value={activeCount}
          unit="Orang"
        />
        <StatCard
          icon={<HiClock className="text-2xl text-amber-500" />}
          iconBg="bg-amber-50"
          label="Pending"
          value={pendingCount}
          unit="Orang"
        />
        <StatCard
          icon={<HiXCircle className="text-2xl text-red-500" />}
          iconBg="bg-red-50"
          label="Ditolak"
          value={rejectedCount}
          unit="Orang"
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, atau telepon..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F7B4A]/30 text-sm"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
          >
            <HiFunnel className="text-base" />
            Filter
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {(["ALL", "ACTIVE", "PENDING", "REJECTED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                    setShowFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    statusFilter === s
                      ? "text-[#0F7B4A] font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {s === "ALL" ? "Semua Status" : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Component */}
      <FieldAdminTable
        loading={loading}
        paginatedAdmins={paginatedAdmins}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        totalFiltered={filteredAdmins.length}
        setPage={setPage}
        onToggleStatus={handleToggleStatus}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Modal Component */}
      {showModal && (
        <FieldAdminModal
          admin={editingAdmin}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Komponen Helper untuk tampilan Card di atas
function StatCard({
  icon,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">
          {value}
        </p>
        <p className="text-xs text-gray-400">{unit}</p>
      </div>
    </div>
  );
}
