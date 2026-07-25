<?php

namespace App\Mail;

use App\Models\ProcurementOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProcurementSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    // Properti publik agar otomatis bisa dibaca oleh file Blade View
    public ProcurementOrder $order;
    public string $recipientRole; // 👈 1. Tambahkan properti ini

    /**
     * Create a new message instance.
     */
    // 👈 2. Set default value ke 'Dinas Pertanian' agar tidak merusak kode yang sudah ada
    public function __construct(ProcurementOrder $order, string $recipientRole = 'Dinas Pertanian')
    {
        $this->order = $order;
        $this->recipientRole = $recipientRole;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pengajuan Pengadaan Pupuk Baru - ' . $this->order->po_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.procurement_submitted',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}