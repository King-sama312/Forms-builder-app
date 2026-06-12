'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const STAGES = [
  'Scanning file system...',
  'Scanning free space...',
  'Checking for cross-linked files...',
  'Verifying directory structure...',
  'Checking disk surface...',
];

const GRID_COLS = 20;
const GRID_ROWS = 8;

function randomColor(): string {
  const colors = ['#0000FF', '#008080', '#00AA00', '#808000', '#800080', '#0080FF', '#00FF00', '#FFFF00'];
  return colors[Math.floor(Math.random() * colors.length)]!;
}

export function ScanDisk({ onClose }: { onClose?: () => void }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [grid, setGrid] = useState<string[]>(() =>
    Array.from({ length: GRID_COLS * GRID_ROWS }, () => '#c0c0c0'),
  );
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [closed, setClosed] = useState(false);
  const animRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const advanceStage = useCallback(() => {
    setStageIndex(prev => {
      if (prev < STAGES.length - 1) return prev + 1;
      return prev;
    });
  }, []);

  useEffect(() => {
    const audio = new Audio('/system-sounds/rmultimediaeu-scanner-scanning-sound-250306.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audioRef.current = audio;

    let lastGridUpdate = 0;
    let counter = 0;

    const tick = () => {
      counter++;

      setProgress(prev => {
        const next = prev + 0.15 + Math.random() * 0.3;
        if (next >= 100) {
          if (stageIndex < STAGES.length - 1) {
            advanceStage();
            return 0;
          }
          audio.pause();
          if (animRef.current) cancelAnimationFrame(animRef.current);
          return 100;
        }
        return Math.min(next, 100);
      });

      if (counter - lastGridUpdate > 3) {
        lastGridUpdate = counter;
        setGrid(prev => {
          const next = [...prev];
          const idx = Math.floor(Math.random() * next.length);
          if (Math.random() > 0.3) {
            next[idx] = randomColor();
          } else {
            next[idx] = '#c0c0c0';
          }
          return next;
        });
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      audio.pause();
      audio.src = '';
    };
  }, [stageIndex, advanceStage]);

  const handleCancel = () => {
    setConfirmCancel(true);
  };

  const handleConfirmYes = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setClosed(true);
    onClose?.();
  };

  const handleConfirmNo = () => {
    setConfirmCancel(false);
  };

  if (closed) return null;

  if (confirmCancel) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-[#c0c0c0]">
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-bold mb-2">ScanDisk</div>
          <div className="text-sm">Are you sure you want to cancel?</div>
          <div className="text-sm text-gray-600">Forms may be lost.</div>
        </div>
        <div className="flex gap-4">
          <button className="win98-btn px-4 py-1" onClick={handleConfirmYes}>Yes</button>
          <button className="win98-btn px-4 py-1" onClick={handleConfirmNo}>No</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-[Tahoma,Arial,sans-serif] text-xs">
      <div className="flex items-center gap-3 p-3 border-b border-[#808080]">
        <div
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #000080, #0000FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
            border: '2px solid #808080',
          }}
        >
          98
        </div>
        <div>
          <div className="font-bold text-sm">ScanDisk</div>
          <div className="text-[10px] text-gray-600">Forms Drive (C:)</div>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-auto">
        <div className="mb-2 font-bold">{STAGES[stageIndex]}</div>

        <div className="mb-3">
          <div
            className="border border-[#808080] bg-white"
            style={{ height: 14, position: 'relative' }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0000AA, #0000FF)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div className="text-right text-[10px] text-gray-600 mt-0.5">
            {Math.floor(progress)}% complete
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gap: 1,
            border: '2px inset #808080',
            padding: 2,
            background: '#808080',
            marginBottom: 8,
          }}
        >
          {grid.map((color, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: color,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          ))}
        </div>

        <div className="text-[10px] text-gray-600">
          Approximately 47 minutes remaining
        </div>
      </div>

      <div className="flex justify-end p-2 border-t border-[#808080]">
        <button className="win98-btn px-6 py-1 text-xs" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
