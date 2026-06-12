'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ScanDisk } from '~/components/scan-disk';
import { useWindowManager } from '~/components/windows-context';

export default function ScanDiskPage() {
  const router = useRouter();
  const { openWindow, closeWindow } = useWindowManager();
  const closeRef = useRef(closeWindow);
  closeRef.current = closeWindow;

  useEffect(() => {
    openWindow(
      'scan-disk',
      'ScanDisk - Forms Drive (C:)',
      <div className="flex flex-col h-full">
        <ScanDisk onClose={() => closeRef.current('scan-disk')} />
      </div>,
      { x: 150, y: 80, width: 480, height: 400 },
      () => router.push('/'),
    );
  }, [openWindow, router]);

  return null;
}
