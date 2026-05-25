'use client';

import { useState, useCallback } from 'react';
import { BootScreen } from '~/components/boot-screen';
import { useGetUserInfo } from '~/hooks/api/auth/index';

const STORAGE_KEY = 'win98-booted';

export default function HomePage() {
  const { isLoading } = useGetUserInfo();
  const [booted, setBooted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setBooted(true);
  }, []);

  if (!booted) return <BootScreen onBootComplete={handleBootComplete} />;
  if (isLoading) return null;

  // Desktop only — no welcome window
  return null;
}
