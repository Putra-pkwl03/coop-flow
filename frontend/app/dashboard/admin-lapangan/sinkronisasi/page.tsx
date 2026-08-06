"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCloudUploadAlt, FaSyncAlt, FaTrash, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { db, SyncQueue } from "../../../lib/db";
import { syncOfflineData } from "../../../lib/syncEngine";

// Import Komponen Terpisah
import ConnectionStatusBadge from "@/app/components/dashboard/sync/ConnectionStatusBadge";
import SyncStatsCard from "@/app/components/dashboard/sync/SyncStatsCard";
import SyncMessageAlert from "@/app/components/dashboard/sync/SyncMessageAlert";
import QueueTable from "@/app/components/dashboard/sync/QueueTable";
import PayloadModal from "@/app/components/dashboard/sync/PayloadModal";

export default function SinkronisasiPage() {
  const [queueItems, setQueueItems] = useState<SyncQueue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [selectedPayload, setSelectedPayload] = useState<Record<string, any> | null>(null);

  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // 1. Memuat Data Antrean
  const loadQueueData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await db.syncQueue.orderBy("created_at").reverse().toArray();
      setQueueItems(items);
    } catch (error) {
      console.error("Gagal memuat antrean sinkronisasi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Monitoring Status Koneksi
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    loadQueueData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadQueueData]);

  // 3. Eksekusi Sinkronisasi Manual
  const handleSyncNow = async () => {
    if (!isOnline) {
      setSyncMessage({
        type: "error",
        text: "Tidak ada koneksi internet. Aktifkan internet untuk melakukan sinkronisasi.",
      });
      return;
    }

    if (queueItems.length === 0) {
      setSyncMessage({
        type: "info",
        text: "Tidak ada antrean data yang perlu disinkronkan.",
      });
      return;
    }

    setIsSyncing(true);
    setSyncMessage({
      type: "info",
      text: "Sedang menyinkronkan data ke server...",
    });

    try {
      const hasSynced = await syncOfflineData();
      await loadQueueData();

      if (hasSynced) {
        setSyncMessage({
          type: "success",
          text: "Berhasil menyinkronkan data ke server backend!",
        });
      } else {
        setSyncMessage({
          type: "error",
          text: "Gagal menyinkronkan beberapa data. Periksa koneksi atau payload data.",
        });
      }
    } catch (err) {
      console.error("Error sync:", err);
      setSyncMessage({
        type: "error",
        text: "Terjadi kesalahan sistem saat menyinkronkan data.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Hapus Item Tunggal
  const handleDeleteItem = async (id?: number) => {
    if (!id) return;
    if (confirm("Apakah Anda yakin ingin menghapus antrean data ini? Data ini tidak akan terkirim ke server.")) {
      try {
        await db.syncQueue.delete(id);
        await loadQueueData();
        setSyncMessage({
          type: "info",
          text: "Item antrean berhasil dihapus.",
        });
      } catch (error) {
        console.error("Gagal menghapus item:", error);
      }
    }
  };

  // 5. Bersihkan Seluruh Antrean
  const handleClearAllQueue = async () => {
    if (confirm("PERINGATAN! Semua data lokal yang belum tersinkron akan dihapus secara permanen. Lanjutkan?")) {
      try {
        await db.syncQueue.clear();
        await loadQueueData();
        setSyncMessage({
          type: "info",
          text: "Semua antrean sinkronisasi telah dibersihkan.",
        });
      } catch (error) {
        console.error("Gagal membersihkan antrean:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/admin-lapangan"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <FaArrowLeft className="mr-2 text-[10px]" /> Kembali ke Dashboard
          </Link>
          <ConnectionStatusBadge isOnline={isOnline} />
        </div>

        {/* Main Action Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <FaCloudUploadAlt className="text-emerald-600 text-2xl" />
              Sinkronisasi Data Offline
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Kelola dan simpan data lokal ke server backend saat koneksi internet tersedia secara aman.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {queueItems.length > 0 && (
              <button
                onClick={handleClearAllQueue}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaTrash className="text-xs" /> Kosongkan
              </button>
            )}

            <button
              onClick={handleSyncNow}
              disabled={!isOnline || queueItems.length === 0 || isSyncing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 transition-all ${
                !isOnline || queueItems.length === 0 || isSyncing
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-200"
              }`}
            >
              <FaSyncAlt className={`text-xs ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
            </button>
          </div>
        </div>

        {/* Dynamic Alert Message */}
        <SyncMessageAlert message={syncMessage} onClose={() => setSyncMessage(null)} />

        {/* Stats Summary Cards */}
        <SyncStatsCard queueLength={queueItems.length} isOnline={isOnline} />

        {/* Queue Table */}
        <QueueTable
          queueItems={queueItems}
          loading={loading}
          onViewPayload={(payload) => setSelectedPayload(payload)}
          onDeleteItem={handleDeleteItem}
        />
      </div>

      {/* JSON Payload Modal View */}
      <PayloadModal payload={selectedPayload} onClose={() => setSelectedPayload(null)} />
    </div>
  );
}