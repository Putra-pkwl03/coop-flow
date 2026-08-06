"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation"; 
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
  const router = useRouter(); 

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
    <div className="min-h-screen bg-[#f8fafc] text-zinc-800 antialiased font-sans pb-12 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        
        {/* TOPBAR HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/admin-lapangan')}
              className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-800 shadow-xs transition cursor-pointer"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                <FaCloudUploadAlt className="text-emerald-600" />
                Sinkronisasi Data Offline
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Kelola dan kirim data lokal ke server backend saat koneksi internet tersedia
              </p>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="self-start sm:self-auto">
            <ConnectionStatusBadge isOnline={isOnline} />
          </div>
        </div>

        {/* Action Controls Card */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-zinc-200/80">
          <div className="text-xs text-zinc-500 font-medium hidden sm:block">
            {queueItems.length > 0 
              ? `Terdapat ${queueItems.length} antrean data menunggu untuk disinkronkan.`
              : "Semua data lokal telah tersinkronisasi."}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {queueItems.length > 0 && (
              <button
                onClick={handleClearAllQueue}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FaTrash className="text-xs" /> Kosongkan
              </button>
            )}

            <button
              onClick={handleSyncNow}
              disabled={!isOnline || queueItems.length === 0 || isSyncing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                !isOnline || queueItems.length === 0 || isSyncing
                  ? "bg-zinc-300 cursor-not-allowed shadow-none"
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