'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecycleBin } from '~/components/form/recycle-bin';
import { useWindowManager } from '~/components/windows-context';

function RecycleBinWindowContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto border border-[#808080] bg-white">
        <RecycleBin />
      </div>

      <div className="mt-2 text-xs text-gray-600 border-t border-[#808080] pt-1">
        Use &ldquo;Restore&rdquo; to recover a deleted form.
      </div>
    </div>
  );
}

export default function RecycleBinPage() {
  const router = useRouter();
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow('recycle-bin', 'Recycle Bin', <RecycleBinWindowContent />, { x: 100, y: 80, width: 520, height: 380 }, () => router.push('/forms'));
  }, [openWindow, router]);

  return null;
}
