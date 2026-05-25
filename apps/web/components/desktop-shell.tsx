'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DesktopIcons } from './desktop-icons';
import { Taskbar } from './taskbar';
import { ShutdownScreen } from './shutdown-screen';

export function DesktopShell({ children }: { children: ReactNode }) {
  const [shuttingDown, setShuttingDown] = useState(false);
  const pathname = usePathname();

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
        </div>
      </div>
      <Taskbar onShutdown={() => setShuttingDown(true)} />
    </>
  );
}
