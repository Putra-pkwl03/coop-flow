<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Status Verifikasi Pengadaan Pupuk</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #2980b9; padding-bottom: 10px;">
            Update Status Verifikasi Pengadaan
        </h2>
        
        <p>Halo Pengurus Koperasi <strong>{{ $order->cooperative->name ?? '' }}</strong>,</p>
        <p>Pengajuan dokumen pengadaan Anda dengan Nomor PO: <strong>{{ $order->po_number }}</strong> telah diverifikasi oleh Dinas Pertanian.</p>
        
        <div style="padding: 12px; background-color: #f8f9fa; border-left: 4px solid #2980b9; margin: 15px 0;">
            <strong>Status Saat Ini:</strong> {{ $order->status_verifikasi }}
        </div>

        @if($order->status_verifikasi === 'REJECTED_DINAS')
            <p style="color: #c0392b;"><strong>Alasan Penolakan:</strong></p>
            <blockquote style="background: #fdf2e9; border-left: 4px solid #e67e22; margin: 0; padding: 10px;">
                {{ $order->rejection_reason ?? 'Tidak ada catatan.' }}
            </blockquote>
        @else
            <p style="color: #27ae60;">Dokumen pengadaan Anda telah disetujui / disesuaikan oleh Dinas Pertanian dan diteruskan ke tahap verifikasi Kemenko.</p>
            @if(!empty($order->notes_from_verifier))
                <p><strong>Catatan Verifikator:</strong> {{ $order->notes_from_verifier }}</p>
            @endif
        @endif

        <p style="margin-top: 25px;">Anda dapat mengecek detail lengkapnya pada portal sistem.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">Email ini dikirim secara otomatis oleh Sistem Pengadaan Pupuk Bersubsidi.</p>
    </div>
</body>
</html>