'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notepad, type NotepadHandle } from '~/components/notepad';
import { useWindowManager } from '~/components/windows-context';

export default function NotepadPage() {
  const router = useRouter();
  const { openWindow, forceClose, setCloseBlocker } = useWindowManager();
  const notepadRef = useRef<NotepadHandle>(null);

  useEffect(() => {
    setCloseBlocker('notepad', () => {
      notepadRef.current?.requestClose();
      return true;
    });

    openWindow(
      'notepad',
      'Notepad',
      <div className="flex flex-col h-full">
        <Notepad ref={notepadRef} onClose={() => forceClose('notepad')} />
      </div>,
      { x: 100, y: 60, width: 640, height: 480 },
      () => router.push('/'),
    );

    return () => setCloseBlocker('notepad', null);
  }, [openWindow, router, forceClose, setCloseBlocker]);

  return null;
}
