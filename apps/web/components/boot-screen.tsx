'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface BootScreenProps {
  onBootComplete: () => void;
  clickToStart?: boolean;
}

export function BootScreen({ onBootComplete, clickToStart }: BootScreenProps) {
  const [started, setStarted] = useState(!clickToStart);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(!clickToStart);

  const playAudio = useCallback(() => {
    try {
      const audio = new Audio('/win98-startup.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {}
  }, []);

  const handleClick = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStarted(true);
  }, []);

  useEffect(() => {
    if (!started) return;

    playAudio();

    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let current = 0;

    const id = setInterval(() => {
      current += 1;
      const pct = Math.min(Math.round((current / steps) * 100), 100);
      setProgress(pct);
      if (current >= steps) {
        clearInterval(id);
      }
    }, interval);

    return () => {
      clearInterval(id);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [started, playAudio]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(onBootComplete, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, onBootComplete]);

  return (
    <div
      onClick={clickToStart ? handleClick : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        backgroundColor: '#000080',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: clickToStart && !started ? 'pointer' : 'default',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <Image
          src="/windows-98-microsoft-icon.png"
          alt="Windows 98"
          width={200}
          height={200}
          priority
          unoptimized
        />
      </div>

      {clickToStart && !started && (
        <div
          style={{
            color: 'white',
            fontSize: '1rem',
            fontFamily: "'Pixelated MS Sans Serif', Arial, sans-serif",
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          Click anywhere to start Windows 98
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '4rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '18rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid black',
            height: '18px',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#000080',
              width: `${progress}%`,
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '0.75rem',
            marginTop: '0.375rem',
            fontFamily: "'Pixelated MS Sans Serif', Arial, sans-serif",
          }}
        >
          {started ? 'Starting Windows 98...' : 'Ready'}
        </div>
      </div>
    </div>
  );
}
