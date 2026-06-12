'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DesktopIcons } from './desktop-icons';
import { Taskbar } from './taskbar';
import { ShutdownScreen } from './shutdown-screen';
import { WindowManager } from './window-manager';
import { BsodScreen } from './bsod-screen';
import { TipsDialog, shouldShowTipsOnStartup } from './tips-dialog';
import { useWindowManager } from './windows-context';

export function DesktopShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [shuttingDown, setShuttingDown] = useState(false);
  const [showBsod, setShowBsod] = useState(false);
  const pathname = usePathname();
  const { openWindow } = useWindowManager();

  useEffect(() => {
    if (shouldShowTipsOnStartup()) {
      openWindow(
        'tips-dialog',
        'Welcome to Forms Builder 98',
        <div className="flex flex-col h-full">
          <TipsDialog />
        </div>,
        { x: 200, y: 120, width: 420, height: 260 },
      );
    }
  }, [openWindow]);

  const handleBsodDismiss = useCallback(() => {
    setShowBsod(false);
  }, []);

  const handleTriggerBsod = useCallback(() => {
    setShowBsod(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'n') {
        e.preventDefault();
        router.push('/forms/create-form');
      }
      if (e.ctrlKey && e.altKey && e.key === 'd') {
        e.preventDefault();
        handleTriggerBsod();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, handleTriggerBsod]);

  if (shuttingDown) {
    return <ShutdownScreen />;
  }

  if (pathname === '/startup') {
    return <>{children}</>;
  }

  return (
    <>
      <div className="win98-desktop relative w-screen h-screen overflow-hidden">
        <div className="relative w-full h-[calc(100vh-28px)]">
          <DesktopIcons onTriggerBsod={handleTriggerBsod} />
          {children}
          <WindowManager />
        </div>
      </div>
      <Taskbar onShutdown={() => setShuttingDown(true)} />
      {showBsod && <BsodScreen onDismiss={handleBsodDismiss} />}
    </>
  );
}
