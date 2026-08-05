// app/~offline/page.tsx
export default function OfflinePage() {
  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Koneksi Terputus 📶</h1>
      <p>Anda sedang offline. Silakan periksa koneksi internet Anda untuk mengakses halaman ini.</p>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }}>
        Coba Muat Ulang
      </button>
    </div>
  );
}