'use client';

import { useEffect, useCallback } from 'react';

const BSOD_LINES = [
  'A fatal exception 0E has occurred at 0028:C0001E6F in VXD VMM(01) + 000016DE.',
  'The current application will be terminated.',
  '',
  '* Press any key to restart the system.',
  '* Press CTRL+ALT+D again to see the blue screen of death.',
  '  (Just kidding, your forms are fine.)',
  '',
  'FormsBuilder FAT32 Error: Segment: 0A28  |  Page: 00F4  |  Sector: 7B',
  'Microsoft Windows 98  [Version 4.10.1998]',
];

export function BsodScreen({ onDismiss }: { onDismiss: () => void }) {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    const handler = () => handleDismiss();
    window.addEventListener('click', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [handleDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#0000AA',
        color: '#FFFFFF',
        fontFamily: '"Courier New", "Courier", "Consolas", monospace',
        fontSize: 16,
        lineHeight: 1.4,
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: 24, fontSize: 18, fontWeight: 'bold' }}>
        Windows 98
      </div>
      {BSOD_LINES.map((line, i) => (
        <div key={i} style={{ marginBottom: line === '' ? 12 : 4, whiteSpace: 'pre-wrap' }}>
          {line}
        </div>
      ))}
      <div style={{ marginTop: 40, animation: 'blink 1s step-end infinite' }}>
        _
      </div>
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
