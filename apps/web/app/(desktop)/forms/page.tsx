'use client';

import { useRouter } from 'next/navigation';
import { Win98Window } from '~/components/win98-window';
import { FormList } from '~/components/form/form-list';
import { trpc } from '~/trpc/client';

export default function FormsPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const handleRefresh = () => {
    utils.form.listForms.invalidate();
  };

  return (
    <Win98Window
      title="My Forms"
      defaultPosition={{ x: 80, y: 60, width: 520, height: 380 }}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#808080]">
          <button onClick={() => router.push('/forms/create-form')}>
            📄 New Form
          </button>
          <button onClick={() => router.push('/forms/recycle-bin')}>
            🗑 Recycle Bin
          </button>
          <button onClick={handleRefresh}>
            🔄 Refresh
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto border border-[#808080] bg-white">
          <FormList />
        </div>

        {/* Status bar */}
        <div className="mt-2 text-xs text-gray-600 border-t border-[#808080] pt-1">
          Double-click a form to open the builder.
        </div>
      </div>
    </Win98Window>
  );
}