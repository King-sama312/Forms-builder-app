'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { DesktopIcons } from './desktop-icons';
import { Taskbar } from './taskbar';
import { ShutdownScreen } from './shutdown-screen';
import { WindowManager } from './window-manager';
import { BsodScreen } from './bsod-screen';
import { TipsDialog, shouldShowTipsOnStartup } from './tips-dialog';
import { DesktopContextMenu } from './desktop-context-menu';
import { useWindowManager } from './windows-context';
import { useSettingsStore } from '~/store/settings-store';
import { getWallpaperStyle, applyColorScheme } from '~/lib/theme-config';

export function DesktopShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [shuttingDown, setShuttingDown] = useState(false);
  const [showBsod, setShowBsod] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const pathname = usePathname();
  const { openWindow, closeWindow } = useWindowManager();
  const { wallpaper, colorScheme, customWallpaper } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
    applyColorScheme(colorScheme);
  }, [colorScheme]);

  const wallpaperStyle = mounted
    ? getWallpaperStyle(wallpaper, customWallpaper)
    : { backgroundColor: '#008080' };

  useEffect(() => {
    if (shouldShowTipsOnStartup()) {
      openWindow(
        'tips-dialog',
        'Welcome to Forms Builder 98',
        <div className="flex flex-col h-full">
          <TipsDialog onClose={() => closeWindow('tips-dialog')} />
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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAutoArrange = useCallback(() => {
    setResetCounter(c => c + 1);
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
      <div
        className="win98-desktop relative w-screen h-screen overflow-hidden"
        style={wallpaperStyle}
        onContextMenu={handleContextMenu}
      >
        <div className="relative w-full h-[calc(100vh-28px)]">
          <DesktopIcons onTriggerBsod={handleTriggerBsod} resetCounter={resetCounter} />
          {children}
          <WindowManager />
        </div>
      </div>
      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onAutoArrange={handleAutoArrange}
        />
      )}
      <Taskbar onShutdown={() => setShuttingDown(true)} />
      {showBsod && <BsodScreen onDismiss={handleBsodDismiss} />}
    </>
  );
}
