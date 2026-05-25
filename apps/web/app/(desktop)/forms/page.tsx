'use client';

import { useState } from 'react';
import { Win98Window } from '~/components/win98-window';
import { FormList } from '~/components/form/form-list';
import { CreateFormModal } from '~/components/form/create-form-modal';

export default function FormsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Win98Window
      title="My Forms"
      defaultPosition={{ x: 80, y: 60, width: 520, height: 380 }}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#808080]">
          <button onClick={() => setShowCreate(true)}>
            📄 New Form
          </button>
          <button onClick={() => window.location.reload()}>
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

      {showCreate && <CreateFormModal onClose={() => setShowCreate(false)} />}
    </Win98Window>
  );
}