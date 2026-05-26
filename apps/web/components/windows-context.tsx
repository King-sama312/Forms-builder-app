'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface WindowInfo {
  id: string;
  title: string;
  pathname: string;
  minimized: boolean;
  maximized: boolean;
}

interface WindowsContextType {
  windows: WindowInfo[];
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  isMinimized: (id: string) => boolean;
  registerWindow: (id: string, title: string, pathname: string) => void;
  unregisterWindow: (id: string) => void;
  setWindowMaximized: (id: string, maximized: boolean) => void;
}

const WindowsContext = createContext<WindowsContextType | undefined>(undefined);

export function WindowsProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowInfo[]>([]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const next = prev.map(w => w.id === id ? { ...w, minimized: true } : w);
      return next;
    });
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const next = prev.map(w => w.id === id ? { ...w, minimized: false } : w);
      return next;
    });
  }, []);

  const isMinimized = useCallback((id: string): boolean => {
    return windows.some(w => w.id === id && w.minimized);
  }, [windows]);

  const registerWindow = useCallback((id: string, title: string, pathname: string) => {
    setWindows(prev => {
      const existing = prev.findIndex(w => w.pathname === pathname);
      if (existing !== -1) {
        return prev.map((w, i) => i === existing ? { ...w, id, title, minimized: false, maximized: false } : w);
      }
      return [...prev, { id, title, pathname, minimized: false, maximized: false }];
    });
  }, []);

  const unregisterWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const setWindowMaximized = useCallback((id: string, maximized: boolean) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized } : w));
  }, []);

  const contextValue = { windows, minimizeWindow, restoreWindow, isMinimized, registerWindow, unregisterWindow, setWindowMaximized };

  return (
    <WindowsContext.Provider value={contextValue}>
      {children}
    </WindowsContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowsContext);
  if (context === undefined) {
    throw new Error('useWindows must be used within a WindowsProvider');
  }
  return context;
}