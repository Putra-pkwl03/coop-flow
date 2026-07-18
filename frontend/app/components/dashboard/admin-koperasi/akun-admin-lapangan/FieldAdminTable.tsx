import React from "react";
import {
  HiPencilSquare,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { FieldAdmin } from "../../../../types/fieldAdmin";

interface FieldAdminTableProps {
  loading: boolean;
  paginatedAdmins: FieldAdmin[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalFiltered: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onToggleStatus: (id: number) => void;
  onEdit: (admin: FieldAdmin) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABEL: Record<FieldAdmin["status"], string> = {
  ACTIVE: "Aktif",
  PENDING: "Pending",
  REJECTED: "Ditolak",
};

const STATUS_STYLE: Record<FieldAdmin["status"], string> = {
  ACTIVE: "bg-green-50 text-green-600",
  PENDING: "bg-amber-50 text-amber-600",
  REJECTED: "bg-red-50 text-red-500",
};

const STATUS_DOT: Record<FieldAdmin["status"], string> = {
  ACTIVE: "bg-green-500",
  PENDING: "bg-amber-500",
  REJECTED: "bg-red-500",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function FieldAdminTable({
  loading,
  paginatedAdmins,
  page,
  pageSize,
  totalPages,
  totalFiltered,
  setPage,
  onToggleStatus,
  onEdit,
  onDelete,
}: FieldAdminTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="p-4 font-medium">No</th>
              <th className="p-4 font-medium">Nama</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">No. Telepon</th>
              <th className="p-4 font-medium">Terdaftar</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : paginatedAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              paginatedAdmins.map((admin, idx) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60"
                >
                  <td className="p-4 text-gray-500">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F7B4A]/10 text-[#0F7B4A] flex items-center justify-center font-semibold text-xs shrink-0">
                        {initials(admin.name)}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {admin.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{admin.email}</td>
                  <td className="p-4 text-gray-600">{admin.phone ?? "-"}</td>
                  <td className="p-4 text-gray-600">
                    {formatDate(admin.created_at)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onToggleStatus(admin.id)}
                      title="Klik untuk ubah status"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        STATUS_STYLE[admin.status]
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_DOT[admin.status]
                        }`}
                      />
                      {STATUS_LABEL[admin.status]}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(admin)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <HiPencilSquare className="text-base" />
                      </button>
                      <button
                        onClick={() => onDelete(admin.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <HiTrash className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          Menampilkan {totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1} -{" "}
          {Math.min(page * pageSize, totalFiltered)} dari {totalFiltered} data
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
          >
            <HiChevronLeft />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                p === page
                  ? "bg-[#0F7B4A] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
          >
            <HiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
