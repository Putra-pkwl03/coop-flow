// lib/syncEngine.ts
import { db, SyncQueue } from './db';
import api from './axios';

let isSyncing = false;

export async function syncOfflineData(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.onLine) return false;
  if (isSyncing) return false;

  isSyncing = true;
  let hasSyncedAny = false;

  try {
    const pendingQueue: SyncQueue[] = await db.syncQueue.toArray();

    if (pendingQueue.length === 0) {
      isSyncing = false;
      return false;
    }

    console.log(`[Sync Engine] Memulai sinkronisasi ${pendingQueue.length} data offline...`);

    for (const item of pendingQueue) {
      try {
        let targetUrl = item.endpoint;
        
        if (!targetUrl) {
          if (item.action === 'CREATE') {
            targetUrl = `/${item.table_name}`;
          } else {
            const entityId = item.payload?.id || '';
            targetUrl = `/${item.table_name}${entityId ? `/${entityId}` : ''}`;
          }
        }

        const httpMethod = item.method 
          ? item.method.toLowerCase() 
          : (item.action === 'CREATE' ? 'post' : 'put');

        // Pastikan payload bersih sebelum dikirim
        const response = await api.request({
          url: targetUrl,
          method: httpMethod,
          data: item.payload,
        });

        if (response.status >= 200 && response.status < 300) {
          if (item.id) {
            await db.syncQueue.delete(item.id);
          }
          hasSyncedAny = true;
          console.log(`[Sync Engine] ✅ Sukses sync ID ${item.id} -> ${httpMethod.toUpperCase()} ${targetUrl}`);
        }
      } catch (error: any) {
        const status = error.response?.status;
        console.error(`[Sync Engine] ❌ Gagal sync item ID ${item.id}:`, error?.response?.data || error.message);

        // Jika error validasi data dari backend (400/422), log pesan spesifik
        if (status === 400 || status === 422) {
          console.warn(`[Sync Engine] Data tidak valid (HTTP ${status}). Periksa format payload. ID Queue: ${item.id}`);
          // Opsi: Hapus jika data korup agar tidak memblokir antrean
          if (item.id) await db.syncQueue.delete(item.id);
        }
      }
    }
  } catch (err) {
    console.error("[Sync Engine] Error pada sistem sinkronisasi:", err);
  } finally {
    isSyncing = false;
  }

  return hasSyncedAny;
}