'use client';

import { Win98Window } from '~/components/win98-window';
import { RecycleBin } from '~/components/form/recycle-bin';

export default function RecycleBinPage() {
  return (
    <Win98Window
      title="Recycle Bin"
      defaultPosition={{ x: 100, y: 80, width: 520, height: 380 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto border border-[#808080] bg-white">
          <RecycleBin />
        </div>

        <div className="mt-2 text-xs text-gray-600 border-t border-[#808080] pt-1">
          Use &ldquo;Restore&rdquo; to recover a deleted form.
        </div>
      </div>
    </Win98Window>
  );
}
