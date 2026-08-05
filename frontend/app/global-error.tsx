'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            Terjadi Kesalahan Sistem
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
            {error?.message || 'Aplikasi mengalami kendala internal.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}