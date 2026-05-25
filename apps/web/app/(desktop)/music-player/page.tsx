'use client';

import { Win98Window } from '~/components/win98-window';
import { MusicPlayer } from '~/components/music-player';

export default function MusicPlayerPage() {
  return (
    <Win98Window
      title="Music Player"
      defaultPosition={{ x: 200, y: 120, width: 400, height: 380 }}
    >
      <div className="flex flex-col h-full">
        <MusicPlayer />
      </div>
    </Win98Window>
  );
}
