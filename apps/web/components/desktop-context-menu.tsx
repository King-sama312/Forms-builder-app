'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowManager } from './windows-context';
import { SystemProperties } from './system-properties';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAutoArrange?: () => void;
}

export function DesktopContextMenu({ x, y, onClose, onAutoArrange }: ContextMenuProps) {
  const router = useRouter();
  const { openWindow } = useWindowManager();
  const menuRef = useRef<HTMLDivElement>(null);
  const [newOpen, setNewOpen] = useState(false);

  const closeAll = useCallback(() => {
    setNewOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const frame = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const menuWidth = 185;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 160);
  const adjustedY = Math.min(y, window.innerHeight - 260);

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#c0c0c0] border-2 py-1 z-[10002] select-none"
      style={{
        left: adjustedX,
        top: adjustedY,
        minWidth: menuWidth,
        borderStyle: 'outset',
        borderColor: '#fff #808080 #808080 #fff',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.4)',
      }}
    >
      <button
        className="w-full text-left px-6 py-1 text-sm hover:bg-[#000080] hover:text-white"
        onClick={() => {
          onAutoArrange?.();
          onClose();
        }}
      >
        Auto Arrange
      </button>

      <div className="border-t border-[#808080] my-1 mx-2" />

      <MenuItemWithSubmenu
        label="New"
        open={newOpen}
        onMouseEnter={() => setNewOpen(true)}
        onMouseLeave={() => setNewOpen(false)}
      >
        {newOpen && (
          <SubMenu>
            <SubMenuItem
              onClick={() => {
                closeAll();
                router.push('/forms/create-form');
              }}
            >
              Form
            </SubMenuItem>
            <SubMenuItem
              onClick={() => {
                closeAll();
                router.push('/notepad');
              }}
            >
              Text Document
            </SubMenuItem>
            <SubMenuItem
              onClick={() => {
                openWindow(
                  'folder-creation',
                  'Folder',
                  <div className="p-4 text-sm">
                    Folder creation is not supported in Forms Builder 98
                  </div>,
                  { x: 200, y: 120, width: 360, height: 120 },
                );
                closeAll();
              }}
            >
              Folder
            </SubMenuItem>
          </SubMenu>
        )}
      </MenuItemWithSubmenu>

      <div className="border-t border-[#808080] my-1 mx-2" />

      <button
        className="w-full text-left px-6 py-1 text-sm hover:bg-[#000080] hover:text-white"
        onClick={() => {
          openWindow(
            'system-properties',
            'System Properties',
            <div className="flex flex-col h-full">
              <SystemProperties />
            </div>,
            { x: 140, y: 80, width: 440, height: 380 },
          );
          onClose();
        }}
      >
        Properties
      </button>
    </div>
  );
}

function MenuItemWithSubmenu({
  label,
  open,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  label: string;
  open: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <button
        className={`w-full text-left px-6 py-1 text-sm flex items-center gap-2 ${
          open ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'
        }`}
      >
        <span className="flex-1">{label}</span>
        <span className="text-xs font-bold">&gt;</span>
      </button>
      {children}
    </div>
  );
}

function SubMenu({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute left-full top-0 bg-[#c0c0c0] border-2 py-1 z-[10003] min-w-[160px]"
      style={{
        borderStyle: 'outset',
        borderColor: '#fff #808080 #808080 #fff',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  );
}

function SubMenuItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full text-left px-6 py-1 text-sm hover:bg-[#000080] hover:text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
