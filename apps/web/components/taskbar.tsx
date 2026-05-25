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
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 28,
          background: '#c0c0c0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2px',
          zIndex: 9999,
          boxSizing: 'border-box',
          borderTop: '1px solid #dfdfdf',
        }}
      >
        <button
          onClick={() => setStartOpen(s => !s)}
          style={{
            height: 22,
            padding: '0 8px',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 700,
            background: '#c0c0c0',
            border: '2px outset #fff',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Start
        </button>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '0 4px',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {activeWindows.map(w => (
            <TaskbarItem key={w.id} active>{w.title}</TaskbarItem>
          ))}
          {minimizedWindows.map(w => (
            <TaskbarItem key={w.id} active={false} onClick={() => restoreWindow(w.id)}>
              {w.title}
            </TaskbarItem>
          ))}
        </div>

        <div
          style={{
            height: 22,
            padding: '0 8px',
            fontSize: 11,
            background: '#c0c0c0',
            border: '2px inset #fff',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
        >
          {user && (
            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email ?? user.fullName ?? 'User'}
            </span>
          )}
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
      onClick={onClick}
      style={{
        height: 22,
        padding: '0 8px',
        fontSize: 11,
        background: active ? '#d4d0c8' : '#c0c0c0',
        border: active ? '2px inset #fff' : '2px outset #fff',
        display: 'flex',
        alignItems: 'center',
        maxWidth: 140,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0,
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
