'use client';

import { Rnd } from 'react-rnd';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import { useWindows } from '~/components/windows-context';

interface Win98WindowProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number; width: number; height: number };
  onClose?: () => void;
  noClose?: boolean;
}

const TASKBAR_HEIGHT = 28;

export function Win98Window({
  title,
  children,
  defaultPosition = { x: 120, y: 100, width: 500, height: 350 },
  onClose,
  noClose = false,
}: Win98WindowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { minimizeWindow, isMinimized, registerWindow, unregisterWindow } = useWindows();
  const windowIdRef = useRef<string>(Math.random().toString(36).substr(2, 9));

  const [windowState, setWindowState] = useState<'normal' | 'maximized'>('normal');
  const [position, setPosition] = useState({ x: defaultPosition.x, y: defaultPosition.y });
  const [size, setSize] = useState({ width: defaultPosition.width, height: defaultPosition.height });
  const prevRef = useRef({ x: defaultPosition.x, y: defaultPosition.y, width: defaultPosition.width, height: defaultPosition.height });

  useEffect(() => {
    registerWindow(windowIdRef.current, title, pathname);
    // No cleanup — windows persist in the taskbar until explicitly closed
  }, [title, pathname]);

  const handleClose = useCallback(() => {
    unregisterWindow(windowIdRef.current);
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  }, [onClose, router, unregisterWindow]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(windowIdRef.current);
  }, [minimizeWindow]);

  const handleMaximize = useCallback(() => {
    if (windowState === 'maximized') {
      setWindowState('normal');
      setPosition({ x: prevRef.current.x, y: prevRef.current.y });
      setSize({ width: prevRef.current.width, height: prevRef.current.height });
    } else {
      prevRef.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      setWindowState('maximized');
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT });
    }
  }, [windowState, position, size]);

  const handleDragStop = useCallback((_e: any, d: { x: number; y: number }) => {
    setPosition({ x: d.x, y: d.y });
  }, []);

  const handleResizeStop = useCallback((_e: any, _dir: any, ref: HTMLElement, _delta: any, pos: { x: number; y: number }) => {
    setSize({ width: ref.offsetWidth, height: ref.offsetHeight });
    setPosition({ x: pos.x, y: pos.y });
  }, []);

  const minimized = isMinimized(windowIdRef.current);
  const isMaximized = windowState === 'maximized';

  if (minimized) return null;

  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: size.width, height: size.height }}
      dragHandleClassName="title-bar"
      bounds="parent"
      minWidth={300}
      minHeight={200}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      style={{ position: 'absolute', zIndex: 50 }}
    >
      <div className="window flex flex-col w-full h-full bg-[#c0c0c0]">
        <div className="title-bar">
          <div className="title-bar-text">
            {title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" onClick={handleMinimize} />
            <button
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
              onClick={handleMaximize}
            />
            {!noClose && (
              <button aria-label="Close" onClick={handleClose} />
            )}
          </div>
        </div>
        <div className="window-body flex-1 overflow-auto p-3">
          {children}
        </div>
      </div>
    </Rnd>
  );
}