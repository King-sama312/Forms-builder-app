'use client';

import { useEffect, useState } from 'react';

interface BootScreenProps {
  onBootComplete: () => void;
}

export function BootScreen({ onBootComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(onBootComplete, 300);
      return () => clearTimeout(timeout);
    }
  }, [progress, onBootComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#000080',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <div
          style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: 700,
            fontFamily: "'Times New Roman', serif",
            fontStyle: 'italic',
            letterSpacing: '0.025em',
            marginBottom: '0.25rem',
          }}
        >
          Windows 98
        </div>
        <div
          style={{
            color: '#d1d5db',
            fontSize: '0.875rem',
            fontFamily: "'Times New Roman', serif",
            letterSpacing: '0.1em',
          }}
        >
          Microsoft
        </div>
      </div>

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
            fontFamily: "'Times New Roman', serif",
          }}
        >
          Starting Windows 98...
        </div>
      </div>
    </div>
  );
}
