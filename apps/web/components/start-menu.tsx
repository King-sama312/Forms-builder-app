'use client';

import { useRouter } from 'next/navigation';
import { useGetUserInfo, useSignOut } from '~/hooks/api/auth/index';
import { useWindowManager } from './windows-context';
import { TipsDialog } from './tips-dialog';
import { DisplayProperties } from './display-properties';

export function StartMenu({ onClose, onShutdown }: { onClose: () => void; onShutdown?: () => void }) {
  const router = useRouter();
  const { user } = useGetUserInfo();
  const { signOutAsync } = useSignOut();
  const { openWindow, closeWindow } = useWindowManager();

  const handleClick = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await signOutAsync(undefined);
    } catch {}
    window.location.href = '/login';
  };

  const handleOpenTips = () => {
    onClose();
    openWindow(
      'tips-dialog',
      'Welcome to Forms Builder 98',
      <div className="flex flex-col h-full">
        <TipsDialog onClose={() => closeWindow('tips-dialog')} />
      </div>,
      { x: 200, y: 120, width: 420, height: 260 },
    );
  };

  const handleOpenDisplay = () => {
    onClose();
    openWindow(
      'display-properties',
      'Display Properties',
      <div className="flex flex-col h-full">
        <DisplayProperties />
      </div>,
      { x: 100, y: 60, width: 560, height: 420 },
    );
  };

  return (
    <div
      className="fixed bottom-[28px] left-0 w-52 bg-[#c0c0c0] border-2 z-[10001]"
      style={{ borderStyle: 'outset' }}
      onMouseLeave={onClose}
    >
      <div className="flex">
        <div className="w-6 bg-[#000080] flex items-end justify-center pb-2">
          <span className="text-white text-xs font-bold rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Windows 98
          </span>
        </div>
        <div className="flex-1 py-1">
          <MenuItem onClick={() => handleClick('/forms')}>
            My Forms
          </MenuItem>
          <div className="border-t border-[#808080] my-1 mx-2" />
          {!user ? (
            <>
              <MenuItem onClick={() => handleClick('/login')}>
                Login
              </MenuItem>
              <MenuItem onClick={() => handleClick('/signup')}>
                Register
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => handleClick('/scan-disk')}>
                ScanDisk
              </MenuItem>
              <MenuItem onClick={() => handleClick('/notepad')}>
                Notepad
              </MenuItem>
              <MenuItem onClick={handleOpenDisplay}>
                Display Properties
              </MenuItem>
              <MenuItem onClick={handleOpenTips}>
                Tips & Tricks
              </MenuItem>
              <MenuItem onClick={handleSignOut}>
                Log Off {user.email ? `(${user.email.split('@')[0]})` : ''}
              </MenuItem>
            </>
          )}
          <div className="border-t border-[#808080] my-1 mx-2" />
          <MenuItem onClick={() => { onShutdown?.(); onClose(); }}>
            Shut Down
          </MenuItem>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="w-full text-left px-2 py-1 text-sm flex items-center gap-2 hover:bg-[#000080] hover:text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}


