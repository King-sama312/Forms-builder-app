'use client';

import { Rnd } from 'react-rnd';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface Win98WindowProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number; width: number; height: number };
  onClose?: () => void;
  noClose?: boolean;
}

export function Win98Window({
  title,
  children,
  defaultPosition = { x: 120, y: 100, width: 500, height: 350 },
  onClose,
  noClose = false,
}: Win98WindowProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  }, [onClose, router]);

  return (
    <Rnd
      default={defaultPosition}
      dragHandleClassName="title-bar"
      bounds="parent"
      style={{ position: 'absolute', zIndex: 50 }}
      minWidth={300}
      minHeight={200}
    >
      <div className="window flex flex-col w-full h-full bg-[#c0c0c0]">
        <div className="title-bar">
          <div className="title-bar-text flex items-center gap-1">
            <span className="w-4 h-4 inline-block border border-black bg-blue-800" />
            {title}
          </div>
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
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