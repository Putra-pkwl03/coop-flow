// lib/syncEngine.ts
import { db, SyncQueue } from './db';
import api from './axios'; // 👈 Gunakan instance Axios yang sama dengan aplikasi

// Flag untuk mencegah fungsi sinkronisasi berjalan ganda (Locking mechanism)
let isSyncing = false;

export async function syncOfflineData(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  if (isSyncing) return; // Jika sedang proses sync, batalkan eksekusi paralel

  isSyncing = true;

  try {
    // 1. Ambil semua antrean dari Dexie
    const pendingQueue: SyncQueue[] = await db.syncQueue.toArray();

    if (pendingQueue.length === 0) {
      isSyncing = false;
      return;
    }

    console.log(`[Sync Engine] Memulai sinkronisasi ${pendingQueue.length} data offline...`);

    for (const item of pendingQueue) {
      try {
        // Determine Endpoint & Method
        // Jika item memiliki properti 'endpoint' khusus, gunakan itu.
        // Jika tidak ada, gunakan default berdasarkan table_name & ID di payload.
        let targetUrl = item.endpoint;
        
        if (!targetUrl) {
          if (item.action === 'CREATE') {
            targetUrl = `/${item.table_name}`;
          } else {
            // Untuk UPDATE, ambil ID dari payload (misal: payload.id)
            const entityId = item.payload?.id || '';
            targetUrl = `/${item.table_name}${entityId ? `/${entityId}` : ''}`;
          }
        }

        const httpMethod = item.method 
          ? item.method.toLowerCase() 
          : (item.action === 'CREATE' ? 'post' : 'put');

        // 2. Kirim Request ke Server via Axios
        const response = await api.request({
          url: targetUrl,
          method: httpMethod,
          data: item.payload,
        });

        // 3. Jika Sukses (HTTP 200/201), Hapus dari Antrean
        if (response.status >= 200 && response.status < 300) {
          if (item.id) {
            await db.syncQueue.delete(item.id);
          }
          console.log(`[Sync Engine] ✅ Sukses sync ID ${item.id} -> ${httpMethod.toUpperCase()} ${targetUrl}`);
        }
      } catch (error: any) {
        const status = error.response?.status;
        console.error(`[Sync Engine] ❌ Gagal sync item ID ${item.id}:`, error.message);

        // Optional Safety: Jika error Client Side (400 atau 422 - data tidak valid),
        // Hapus dari antrean agar tidak menghambat sync data lainnya.
        if (status === 400 || status === 422) {
          console.warn(`[Sync Engine] Menghapus item ID ${item.id} dari antrean karena error validasi (${status}).`);
          if (item.id) await db.syncQueue.delete(item.id);
        }

        // Jika error 5xx (Server Error) atau Network Error, biarkan di queue untuk dicoba lagi nanti.
      }
    }
  } catch (err) {
    console.error("[Sync Engine] Error pada sistem sinkronisasi:", err);
  } finally {
    isSyncing = false; // Un-lock proses sync
  }
}