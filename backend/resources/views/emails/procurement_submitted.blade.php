<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pengajuan Pengadaan Pupuk Baru</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">
            Pengajuan Pengadaan Pupuk Baru
        </h2>
        
        <p>Halo Tim {{ $recipientRole }},</p>
        <p>Koperasi <strong>{{ $order->cooperative->name ?? 'Koperasi' }}</strong> telah mengajukan dokumen Pengadaan Pupuk Bersubsidi Baru dengan rincian sebagai berikut:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f8f9fa;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nomor PO</td>
                <td style="padding: 8px; border: 1px solid #ddd;">{{ $order->po_number }}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Periode Pengadaan</td>
                <td style="padding: 8px; border: 1px solid #ddd;">{{ $order->periode_pengadaan }}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Karung</td>
                <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($order->total_bags_ordered) }} karung</td>
            </tr>
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Berat</td>
                <td style="padding: 8px; border: 1px solid #ddd;">{{ number_format($order->total_weight_kg) }} Kg</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Estimasi Biaya</td>
                <td style="padding: 8px; border: 1px solid #ddd;">Rp {{ number_format($order->total_estimated_cost, 0, ',', '.') }}</td>
            </tr>
        </table>

        <p>Mohon segera masuk ke dalam sistem untuk melakukan verifikasi, penyesuaian, atau persetujuan dokumen ini.</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #777;">Email ini dikirim secara otomatis oleh Sistem Pengadaan Pupuk Bersubsidi.</p>
    </div>
</body>
</html>