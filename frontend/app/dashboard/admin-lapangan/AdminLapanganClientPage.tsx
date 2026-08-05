'use client';

import React, { useState, useEffect } from 'react';
import OverviewContent from '@/app/components/dashboard/OverviewContent';

export default function AdminLapanganClientPage() {
  const [adminName, setAdminName] = useState('Andi');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profile = localStorage.getItem('user_profile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          if (parsed.name) setAdminName(parsed.name);
        } catch (e) {
          console.error('Failed to parse profile:', e);
        }
      }
    }
  }, []);

  return (
    <div className="w-full font-sans">
      <OverviewContent adminName={adminName} />
    </div>
  );
}