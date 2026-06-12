'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export interface WindowInstance {
  id: string;
  title: string;
  component: React.ReactNode;
  state: 'normal' | 'minimized' | 'maximized';
  prevState: 'normal' | 'maximized';
  prevSize: Size;
  prevPosition: Position;
  zIndex: number;
}

interface WindowManagerContext {
  openWindow: (
    id: string,
    title: string,
    component: React.ReactNode,
    defaults?: Partial<Size & Position>,
    onClose?: () => void,
    startMaximized?: boolean,
  ) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, pos: Position) => void;
  updateSize: (id: string, size: Size) => void;
  windows: WindowInstance[];
}

const WindowManagerContext = createContext<WindowManagerContext | undefined>(undefined);

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 350;
const DEFAULT_X = 120;
const DEFAULT_Y = 100;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const zCounter = useRef(0);
  const closeCallbacks = useRef<Map<string, () => void>>(new Map());

  const openWindow = useCallback((
    id: string,
    title: string,
    component: React.ReactNode,
    defaults?: Partial<Size & Position>,
    onClose?: () => void,
    startMaximized?: boolean,
  ) => {
    zCounter.current += 1;
    const shouldMaximize = startMaximized !== false;
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        return prev.map(w => w.id === id ? { ...w, state: shouldMaximize ? 'maximized' : 'normal', zIndex: zCounter.current } : w);
      }
      return [...prev, {
        id,
        title,
        component,
        state: shouldMaximize ? 'maximized' as const : 'normal' as const,
        prevState: 'normal' as const,
        prevSize: { width: defaults?.width ?? DEFAULT_WIDTH, height: defaults?.height ?? DEFAULT_HEIGHT },
        prevPosition: { x: defaults?.x ?? DEFAULT_X, y: defaults?.y ?? DEFAULT_Y },
        zIndex: zCounter.current,
      }];
    });
    if (onClose) {
      closeCallbacks.current.set(id, onClose);
    }
  }, []);

  const closeWindow = useCallback((id: string) => {
    const cb = closeCallbacks.current.get(id);
    cb?.();
    closeCallbacks.current.delete(id);
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, state: 'minimized', prevState: w.state === 'minimized' ? w.prevState : w.state as 'normal' | 'maximized' } : w));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    zCounter.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, state: w.prevState, zIndex: zCounter.current } : w));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.state === 'maximized') {
        return { ...w, state: 'normal' };
      }
      return { ...w, state: 'maximized' };
    }));
  }, []);

  const focusWindow = useCallback((id: string) => {
    zCounter.current += 1;
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      return {
        ...w,
        state: w.state === 'minimized' ? w.prevState : w.state,
        zIndex: zCounter.current,
      };
    }));
  }, []);

  const updatePosition = useCallback((id: string, pos: Position) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, prevPosition: pos } : w));
  }, []);

  const updateSize = useCallback((id: string, size: Size) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, prevSize: size } : w));
  }, []);

  return (
    <WindowManagerContext.Provider value={{ openWindow, closeWindow, minimizeWindow, restoreWindow, maximizeWindow, focusWindow, updatePosition, updateSize, windows }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
}
