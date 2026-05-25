'use client';

import { useRouter } from 'next/navigation';
import { useGetUserInfo, useSignOut } from '~/hooks/api/auth/index';

export function StartMenu({ onClose, onShutdown }: { onClose: () => void; onShutdown?: () => void }) {
  const router = useRouter();
  const { user } = useGetUserInfo();
  const { signOutAsync } = useSignOut();

  const handleClick = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOutAsync(undefined);
    } catch {
      // proceed even if server mutation fails
    }
    sessionStorage.removeItem('win98-booted');
    onClose();
    window.location.href = '/login';
  };

  return (
    <div
      className="fixed bottom-[28px] left-0 w-52 bg-[#c0c0c0] border-2 z-[99]"
      style={{ borderStyle: 'outset', minHeight: 280 }}
      onMouseLeave={onClose}
    >
      <div className="flex">
        {/* Sidebar */}
        <div className="w-6 bg-[#000080] flex items-end justify-center pb-2">
          <span className="text-white text-xs font-bold rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Windows 98
          </span>
        </div>

        <div className="flex-1 py-1">
          <MenuItem onClick={() => handleClick('/forms')}>
            <span className="w-6 h-6 inline-flex items-center justify-center mr-2">📋</span>
            My Forms
          </MenuItem>
          <div className="border-t border-[#808080] my-1 mx-2" />
          {!user ? (
            <>
              <MenuItem onClick={() => handleClick('/login')}>
                <span className="w-6 h-6 inline-flex items-center justify-center mr-2">🔑</span>
                Login
              </MenuItem>
              <MenuItem onClick={() => handleClick('/signup')}>
                <span className="w-6 h-6 inline-flex items-center justify-center mr-2">📝</span>
                Register
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleSignOut}>
              <span className="w-6 h-6 inline-flex items-center justify-center mr-2">🚪</span>
              Log Off {user.email ? `(${user.email.split('@')[0]})` : ''}
            </MenuItem>
          )}
          <div className="border-t border-[#808080] my-1 mx-2" />
          <MenuItem onClick={() => { onShutdown?.(); onClose(); }}>
            <span className="w-6 h-6 inline-flex items-center justify-center mr-2">🖥️</span>
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
      className="w-full text-left px-2 py-1 text-sm flex items-center hover:bg-[#000080] hover:text-white"
      onClick={onClick}
    >
      {children}
    </button>
  );
}