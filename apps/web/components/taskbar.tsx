'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { StartMenu } from './start-menu';
import { useGetUserInfo } from '~/hooks/api/auth/index';

export function Taskbar() {
  const pathname = usePathname();
  const [startOpen, setStartOpen] = useState(false);
  const { user } = useGetUserInfo();

  return (
    <>
      <div
        className="window fixed bottom-0 left-0 right-0 h-[28px] z-[100] flex items-center px-[2px] rounded-none border-l-0 border-r-0 border-b-0"
        style={{ borderTop: '2px solid #dfdfdf' }}
      >
        <button
          className="px-2 h-[22px] font-bold text-sm flex items-center gap-1"
          style={{ borderStyle: 'outset' }}
          onClick={() => setStartOpen((s) => !s)}
        >
          <span className="inline-block w-4 h-4 bg-[#c0c0c0] border border-black">
            <svg viewBox="0 0 16 16" className="w-full h-full">
              <rect x="1" y="1" width="6" height="6" fill="#ff0000" opacity="0.8"/>
              <rect x="9" y="1" width="6" height="6" fill="#00ff00" opacity="0.8"/>
              <rect x="1" y="9" width="6" height="6" fill="#0000ff" opacity="0.8"/>
              <rect x="9" y="9" width="6" height="6" fill="#ffff00" opacity="0.8"/>
            </svg>
          </span>
          Start
        </button>

        <div className="flex-1 flex items-center gap-[2px] px-1 overflow-hidden">
          <TaskbarItem href="/" active={pathname === '/'}>
            Desktop
          </TaskbarItem>
          <TaskbarItem href="/forms" active={pathname === '/forms'}>
            My Forms
          </TaskbarItem>
          {pathname.startsWith('/builder/') && (
            <TaskbarItem href={pathname} active>
              Form Builder
            </TaskbarItem>
          )}
          {pathname === '/login' && (
            <TaskbarItem href="/login" active>
              Login
            </TaskbarItem>
          )}
          {pathname === '/signup' && (
            <TaskbarItem href="/signup" active>
              Register
            </TaskbarItem>
          )}
        </div>

        <div
          className="px-2 h-[22px] text-xs flex items-center gap-2 border"
          style={{ borderStyle: 'inset' }}
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
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-2 h-[22px] text-xs flex items-center truncate max-w-[120px] ${
        active ? 'taskbar-item-active' : ''
      }`}
      style={{
        borderStyle: active ? 'inset' : 'outset',
        borderWidth: '2px',
        textDecoration: 'none',
        color: '#000',
      }}
    >
      {children}
    </Link>
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