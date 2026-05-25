'use client';

import { useState, useEffect } from 'react';
import { StartMenu } from './start-menu';
import { useGetUserInfo } from '~/hooks/api/auth/index';
import { useWindows } from '~/components/windows-context';

export function Taskbar() {
  const [startOpen, setStartOpen] = useState(false);
  const { user } = useGetUserInfo();
  const { windows, restoreWindow } = useWindows();

  const activeWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  return (
    <>
      <div
        className="flex items-center px-[2px] h-[28px] fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: '#c0c0c0',
          boxShadow: 'inset 0 1px 0 #dfdfdf, inset 0 -1px 0 #404040',
        }}
      >
        <button
          className="px-2 h-[22px] font-bold text-sm flex items-center gap-1 shrink-0"
          style={{ borderStyle: 'outset', borderWidth: '2px', background: '#c0c0c0' }}
          onClick={() => setStartOpen((s) => !s)}
        >
          <span className="inline-block w-4 h-4 bg-[#c0c0c0] border border-black">
            <svg viewBox="0 0 16 16" className="w-full h-full">
              <rect x="1" y="1" width="6" height="6" fill="#000080" />
              <rect x="9" y="1" width="6" height="6" fill="#000080" />
              <rect x="1" y="9" width="6" height="6" fill="#000080" />
              <rect x="9" y="9" width="6" height="6" fill="#000080" />
            </svg>
          </span>
          Start
        </button>

        <div className="flex-1 flex items-center gap-[2px] px-1 overflow-hidden min-w-0">
          {activeWindows.map(w => (
            <TaskbarItem key={w.id} active>{w.title}</TaskbarItem>
          ))}
          {minimizedWindows.map(w => (
            <TaskbarItem
              key={w.id}
              active={false}
              onClick={() => restoreWindow(w.id)}
            >
              {w.title}
            </TaskbarItem>
          ))}
        </div>

        <div
          className="px-2 h-[22px] text-xs flex items-center gap-2 shrink-0"
          style={{ borderStyle: 'inset', borderWidth: '2px', background: '#c0c0c0' }}
        >
          {user && <span className="truncate max-w-[100px]">{user.email ?? user.fullName ?? 'User'}</span>}
          <Clock />
        </div>
      </div>

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
    </>
  );
}

function TaskbarItem({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="px-2 h-[22px] text-xs flex items-center truncate max-w-[120px] cursor-pointer shrink-0"
      onClick={onClick}
      style={{
        borderStyle: active ? 'inset' : 'outset',
        borderWidth: '2px',
        textDecoration: 'none',
        color: '#000',
        background: active ? '#d4d0c8' : '#c0c0c0',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}