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

class ProcurementVerifiedMail extends Mailable
{
    use Queueable, SerializesModels;

    public ProcurementOrder $order;

    /**
     * Create a new message instance.
     */
    public function __construct(ProcurementOrder $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusLabel = $this->order->status_verifikasi === 'REJECTED_DINAS' ? 'Ditolak' : 'Disetujui';

        return new Envelope(
            subject: "Status Pengadaan Pupuk ({$statusLabel}) - " . $this->order->po_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.procurement_verified',
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