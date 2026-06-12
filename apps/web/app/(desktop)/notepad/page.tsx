'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notepad } from '~/components/notepad';
import { useWindowManager } from '~/components/windows-context';

export default function NotepadPage() {
  const router = useRouter();
  const { openWindow, closeWindow } = useWindowManager();
  const closeRef = useRef(closeWindow);
  closeRef.current = closeWindow;

  useEffect(() => {
    openWindow(
      'notepad',
      'Notepad',
      <div className="flex flex-col h-full">
        <Notepad onClose={() => closeRef.current('notepad')} />
      </div>,
      { x: 100, y: 60, width: 640, height: 480 },
      () => router.push('/'),
    );
  }, [openWindow, router]);

  return null;
}
