'use client';

import { Rnd } from 'react-rnd';
import { useCallback, useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Win98WindowProps {
  title: string;
  children: React.ReactNode;
  defaultPosition: Position & Size;
  onClose?: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStop: (pos: Position) => void;
  onResizeStop: (size: Size, pos: Position) => void;
  noClose?: boolean;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
}

const TASKBAR_HEIGHT = 28;

export function Win98Window({
  title,
  children,
  defaultPosition,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragStop,
  onResizeStop,
  noClose = false,
  zIndex,
  isMinimized,
  isMaximized,
  isActive,
}: Win98WindowProps) {
  const [position, setPosition] = useState({
    x: isMaximized ? 0 : defaultPosition.x,
    y: isMaximized ? 0 : defaultPosition.y,
  });
  const [size, setSize] = useState({
    width: isMaximized ? window.innerWidth : defaultPosition.width,
    height: isMaximized ? window.innerHeight - TASKBAR_HEIGHT : defaultPosition.height,
  });
  const prevRef = useRef({
    x: defaultPosition.x,
    y: defaultPosition.y,
    width: defaultPosition.width,
    height: defaultPosition.height,
  });
  const [maximized, setMaximized] = useState(isMaximized);

  useEffect(() => {
    if (isMaximized && !maximized) {
      prevRef.current = { x: position.x, y: position.y, width: size.width, height: size.height };
      setMaximized(true);
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT });
    } else if (!isMaximized && maximized) {
      setMaximized(false);
      setPosition({ x: prevRef.current.x, y: prevRef.current.y });
      setSize({ width: prevRef.current.width, height: prevRef.current.height });
    }
  }, [isMaximized, maximized]);

  useEffect(() => {
    if (!maximized) return;
    const handleResize = () => {
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - TASKBAR_HEIGHT });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [maximized]);

  const handleDragStop = useCallback(
    (_e: any, d: { x: number; y: number }) => {
      setPosition({ x: d.x, y: d.y });
      prevRef.current = { ...prevRef.current, x: d.x, y: d.y };
      onDragStop({ x: d.x, y: d.y });
    },
    [onDragStop],
  );

  const handleResizeStop = useCallback(
    (_e: any, _dir: any, ref: HTMLElement, _delta: any, pos: { x: number; y: number }) => {
      const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
      setSize(newSize);
      prevRef.current = { ...prevRef.current, ...newSize, x: pos.x, y: pos.y };
      onResizeStop(newSize, { x: pos.x, y: pos.y });
    },
    [onResizeStop],
  );

  return (
    <div
      style={{
        display: isMinimized ? 'none' : 'block',
        pointerEvents: 'auto',
        position: 'absolute',
        zIndex,
      }}
      onMouseDown={onFocus}
    >
      <Rnd
        position={{ x: position.x, y: position.y }}
        size={{ width: size.width, height: size.height }}
        dragHandleClassName="title-bar"
        minWidth={300}
        minHeight={200}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        disableDragging={maximized}
        enableResizing={!maximized}
      >
        <div className="window flex flex-col w-full h-full bg-[#c0c0c0]">
          <div className="title-bar" style={{ background: isActive ? undefined : '#808080' }}>
            <div className="title-bar-text">{title}</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" onClick={onMinimize} />
              <button
                aria-label={isMaximized ? 'Restore' : 'Maximize'}
                onClick={onMaximize}
              />
              {!noClose && <button aria-label="Close" onClick={onClose} />}
            </div>
          </div>
          <div className="window-body flex-1 overflow-auto p-3">{children}</div>
        </div>
      </Rnd>
    </div>
  );
}
