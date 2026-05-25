'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Phase = 'shutting-down' | 'safe-to-turn-off' | 'fallback';

export function ShutdownScreen() {
  const [phase, setPhase] = useState<Phase>('shutting-down');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const url = '/win98logoff.mp3';
    try {
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {}

    const t1 = setTimeout(() => setPhase('safe-to-turn-off'), 4000);
    const t2 = setTimeout(() => {
      try {
        window.open('', '_self');
        window.close();
      } catch {}
      setPhase('fallback');
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: '#000080',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {phase === 'shutting-down' && (
        <>
          <Image
            src="/windows-98-microsoft-icon.png"
            alt="Windows 98"
            width={160}
            height={160}
            priority
            unoptimized
          />
          <div
            style={{
              color: 'white',
              fontSize: '1.25rem',
              marginTop: '2rem',
              fontFamily: "'Times New Roman', serif",
            }}
          >
            Windows is shutting down...
          </div>
        </>
      )}

      {phase === 'safe-to-turn-off' && (
        <div
          style={{
            color: 'white',
            fontSize: '2.5rem',
            fontFamily: "'Times New Roman', serif",
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          It is now safe to turn off
          <br />
          your computer.
        </div>
      )}

      {phase === 'fallback' && (
        <div
          style={{
            color: 'white',
            fontSize: '1.5rem',
            fontFamily: "'Times New Roman', serif",
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          You can now close this tab safely.
          <div style={{ fontSize: '0.875rem', marginTop: '1rem', opacity: 0.7 }}>
            Press Ctrl+W to close
          </div>
        </div>
      )}
    </div>
  );
}
