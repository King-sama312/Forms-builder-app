'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserInfo } from '~/hooks/api/auth/index';

const STORAGE_KEY = 'desktop-icon-positions';
const SNAP = 80;
const ICON_WIDTH = 82;
const ICON_HEIGHT = 90;
const INITIAL_X = 16;
const INITIAL_Y = 16;

interface Position {
  x: number;
  y: number;
}

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

function loadPositions(): Record<string, Position> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Position>) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, Position>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {}
}

function posKey(p: Position): string {
  return `${p.x},${p.y}`;
}

function resolveCollision(
  target: Position,
  occupied: Set<string>,
  exclude: string,
): Position {
  if (!occupied.has(posKey(target))) return target;
  for (let ring = 1; ring < 50; ring++) {
    for (let dy = -ring; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;
        const candidate: Position = { x: target.x + dx * SNAP, y: target.y + dy * SNAP };
        const key = posKey(candidate);
        if (!occupied.has(key)) return candidate;
      }
    }
  }
  return target;
}

function clampToViewport(pos: Position): Position {
  const maxX = typeof window !== 'undefined' ? window.innerWidth - ICON_WIDTH : 9999;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - ICON_HEIGHT : 9999;
  return {
    x: snap(Math.max(0, Math.min(pos.x, maxX))),
    y: snap(Math.max(0, Math.min(pos.y, maxY))),
  };
}

function useIconPositions(iconKeys: string[]) {
  const [positions, setPositions] = useState<Record<string, Position>>(() => {
    const saved = loadPositions();
    const result: Record<string, Position> = {};
    const occupied = new Set<string>();
    let col = 0;
    let row = 0;
    for (const key of iconKeys) {
      let pos: Position;
      if (saved[key]) {
        pos = { x: snap(saved[key].x), y: snap(saved[key].y) };
      } else {
        pos = { x: snap(INITIAL_X + col * (ICON_WIDTH + 32)), y: snap(INITIAL_Y + row * (ICON_HEIGHT + 24)) };
      }
      pos = clampToViewport(pos);
      pos = resolveCollision(pos, occupied, key);
      result[key] = pos;
      occupied.add(posKey(pos));
      col++;
      if (col >= 2) {
        col = 0;
        row++;
      }
    }
    return result;
  });

  const updatePosition = useCallback((label: string, pos: Position) => {
    setPositions(prev => {
      const occupied = new Set<string>();
      for (const [k, v] of Object.entries(prev)) {
        if (k !== label) occupied.add(posKey(v));
      }
      const clamped = clampToViewport(pos);
      const resolved = resolveCollision(clamped, occupied, label);
      const next = { ...prev, [label]: resolved };
      savePositions(next);
      return next;
    });
  }, []);

  return { positions, updatePosition };
}

function DragIcon({
  label,
  icon,
  position,
  onMove,
  onOpen,
}: {
  label: string;
  icon: React.ReactNode;
  position: Position;
  onMove: (label: string, pos: Position) => void;
  onOpen: () => void;
}) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    iconX: number;
    iconY: number;
    dragging: boolean;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        iconX: rect.left,
        iconY: rect.top,
        dragging: false,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          dragRef.current.dragging = true;
        }
        if (dragRef.current.dragging) {
          onMove(label, {
            x: snap(dragRef.current.iconX + dx),
            y: snap(dragRef.current.iconY + dy),
          });
        }
      };

      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [label, onMove],
  );

  const handleDoubleClick = useCallback(() => {
    if (dragRef.current?.dragging) return;
    onOpen();
  }, [onOpen]);

  return (
    <div
      className="desktop-icon"
      style={{ left: position.x, top: position.y, position: 'absolute' }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-14 h-14 mb-1 pointer-events-none">{icon}</div>
      <span className="text-sm text-center leading-tight pointer-events-none">{label}</span>
    </div>
  );
}

export function DesktopIcons({ onTriggerBsod }: { onTriggerBsod?: () => void }) {
  const router = useRouter();
  const { user } = useGetUserInfo();

  const authedIcons = [
    { label: 'My Forms', icon: <img src="/icons/forms.png" alt="My Forms" className="w-full h-full pixel-art" draggable={false} />, onClick: () => router.push('/forms') },
    { label: 'Recycle Bin', icon: <div className="w-full h-full flex items-center justify-center text-3xl">🗑</div>, onClick: () => router.push('/forms/recycle-bin') },
    { label: 'My Analytics', icon: <div className="w-full h-full flex items-center justify-center text-3xl">📈</div>, onClick: () => router.push('/analytics') },
    { label: 'ScanDisk', icon: <div className="w-full h-full flex items-center justify-center text-3xl">💾</div>, onClick: () => router.push('/scan-disk') },
  ];

  const guestIcons = [
    { label: 'Login', icon: <img src="/icons/login.png" alt="Login" className="w-full h-full pixel-art" draggable={false} />, onClick: () => router.push('/login') },
    { label: 'Register', icon: <img src="/icons/register.png" alt="Register" className="w-full h-full pixel-art" draggable={false} />, onClick: () => router.push('/signup') },
  ];

  const commonIcons = [
    { label: 'Music Player', icon: <img src="/icons/music.png" alt="Music Player" className="w-full h-full pixel-art" draggable={false} />, onClick: () => router.push('/music-player') },
    { label: 'Scary Shortcut', icon: <div className="w-full h-full flex items-center justify-center text-3xl">💀</div>, onClick: () => onTriggerBsod?.() },
  ] as const;

  const allIconDefs = [...(user ? authedIcons : guestIcons), ...commonIcons];

  const keys = allIconDefs.map(d => d.label);
  const { positions, updatePosition } = useIconPositions(keys);

  return (
    <div className="absolute inset-0 z-0">
      {allIconDefs.map(def => (
        <DragIcon
          key={def.label}
          label={def.label}
          icon={def.icon}
          position={positions[def.label] ?? { x: INITIAL_X, y: INITIAL_Y }}
          onMove={updatePosition}
          onOpen={def.onClick}
        />
      ))}
    </div>
  );
}
