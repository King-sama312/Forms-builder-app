'use client';

import { useWindowManager } from './windows-context';
import { useGetUserInfo } from '~/hooks/api/auth/index';

export function SystemProperties() {
  const { closeWindow } = useWindowManager();
  const { user } = useGetUserInfo();

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] select-none">
      <div className="flex-1 overflow-auto p-4 min-h-0">
        <div className="flex gap-4 items-start">
          <div className="flex items-center justify-center shrink-0" style={{ width: 64, height: 64 }}>
            <div className="bg-[#000080] w-12 h-12 flex items-center justify-center rounded">
              <span className="text-white text-2xl font-bold">98</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold mb-3">System</div>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-bold">Microsoft Forms Builder 98</span>
              </div>
              <div>
                Version 4.10.1998
              </div>
              <div>
                <span className="font-bold">Registered to:</span>{' '}
                {user?.email?.split('@')[0] ?? 'Anonymous User'}
              </div>
              <div className="mt-3">
                <span className="font-bold">Computer:</span>{' '}
                FormsBuilder 1.0
              </div>
              <div>
                <span className="font-bold">Processor:</span>{' '}
                Intel Pentium II @ 333MHz
              </div>
              <div>
                <span className="font-bold">Memory:</span>{' '}
                64.0 MB RAM
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end px-3 py-2 border-t border-[#808080] shrink-0 bg-[#c0c0c0]">
        <button
          onClick={() => closeWindow('system-properties')}
          className="px-6 py-1 text-sm"
          style={{
            background: '#c0c0c0',
            border: '2px outset #fff',
            cursor: 'pointer',
            outline: 'none',
            minWidth: 64,
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
