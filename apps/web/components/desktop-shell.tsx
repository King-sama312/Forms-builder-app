'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DesktopIcons } from './desktop-icons';
import { Taskbar } from './taskbar';
import { ShutdownScreen } from './shutdown-screen';
import { WindowManager } from './window-manager';

export function DesktopShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [shuttingDown, setShuttingDown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'n') {
        e.preventDefault();
        router.push('/forms/create-form');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

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
          <DesktopIcons />
          {children}
          <WindowManager />
        </div>
      </div>
      <Taskbar onShutdown={() => setShuttingDown(true)} />
    </>
  );
}
