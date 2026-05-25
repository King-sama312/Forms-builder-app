'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BootScreen } from '~/components/boot-screen';

export default function StartupPage() {
  const router = useRouter();

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('win98-booted', 'true');
    router.replace('/');
  }, [router]);

  return <BootScreen onBootComplete={handleBootComplete} clickToStart />;
}
