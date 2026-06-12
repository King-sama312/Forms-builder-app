'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MusicPlayer } from '~/components/music-player';
import { useWindowManager } from '~/components/windows-context';

export default function MusicPlayerPage() {
  const router = useRouter();
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow(
      'music-player',
      'Music Player',
      <div className="flex flex-col h-full">
        <MusicPlayer />
      </div>,
      { x: 200, y: 120, width: 400, height: 380 },
      () => router.push('/'),
    );
  }, [openWindow, router]);

  return null;
}
