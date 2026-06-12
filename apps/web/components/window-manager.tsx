'use client';

import { useWindowManager } from './windows-context';
import { Win98Window } from './win98-window';
import { createPortal } from 'react-dom';
import { useMemo, useEffect, useState } from 'react';

export function WindowManager() {
  const {
    windows,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
  } = useWindowManager();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxZIndex = useMemo(() => {
    if (windows.length === 0) return 0;
    return Math.max(...windows.map(w => w.zIndex));
  }, [windows]);

  if (!mounted) return null;

  return createPortal(
    <div
      id="window-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {windows.map(w => (
        <Win98Window
          key={w.id}
          title={w.title}
          zIndex={w.zIndex}
          isActive={w.zIndex === maxZIndex}
          isMinimized={w.state === 'minimized'}
          isMaximized={w.state === 'maximized'}
          defaultPosition={{
            x: w.prevPosition.x,
            y: w.prevPosition.y,
            width: w.prevSize.width,
            height: w.prevSize.height,
          }}
          onFocus={() => focusWindow(w.id)}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onMaximize={() => maximizeWindow(w.id)}
          onDragStop={pos => updatePosition(w.id, pos)}
          onResizeStop={(size, pos) => {
            updateSize(w.id, size);
            updatePosition(w.id, pos);
          }}
        >
          {w.component}
        </Win98Window>
      ))}
    </div>,
    document.body,
  );
}
