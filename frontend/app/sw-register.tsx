'use client';

import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('✅ PWA Service Worker Registered:', reg.scope))
        .catch((err) => console.error('❌ Service Worker Registration Failed:', err));
    }
  }, []);

  return null;
}