'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserInfo } from '~/hooks/api/auth';
import { useWindowManager } from '~/components/windows-context';

const MSG = "The AI is deactivated at the moment";

export function Clippy() {
  const router = useRouter();
  const { user } = useGetUserInfo();
  const { windows } = useWindowManager();

  const [showBubble, setShowBubble] = useState(false);
  const [showLoginBubble, setShowLoginBubble] = useState(false);

  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClippyClick = () => {
    setShowBubble(false);
    setShowLoginBubble(false);
    if (loginTimerRef.current) clearTimeout(loginTimerRef.current);

    if (!user) {
      setShowLoginBubble(true);
      loginTimerRef.current = setTimeout(() => setShowLoginBubble(false), 8000);
    } else {
      setShowBubble(true);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => setShowBubble(false), 5000);
    }
  };

  if (windows.some(w => w.state === 'maximized' && w.id !== 'clippy-chat')) return null;

  return (
    <>
      <div className="fixed bottom-14 right-4 z-99999 flex flex-col items-end gap-1">
        {(showBubble || showLoginBubble) && (
          <div className="relative bg-[#ffffcc] border-2 border-[#000080] rounded px-4 py-3 text-base max-w-64 shadow-[2px_2px_0px_#000]" style={{ fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, sans-serif" }}>
            <div className="absolute -bottom-1.75 right-8 w-3 h-3 bg-[#ffffcc] border-r-2 border-b-2 border-[#000080] rotate-45" />
            <p className="leading-tight">
              {showLoginBubble ? 'Log in to use me to make forms!' : MSG}
            </p>
            {showLoginBubble && (
              <>
                <button
                  onClick={() => { setShowLoginBubble(false); if (loginTimerRef.current) clearTimeout(loginTimerRef.current); }}
                  className="absolute cursor-pointer p-0"
                  style={{ top: '-3px', right: '-20px', fontSize: '20px', lineHeight: 1, background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
                  title="Close"
                >
                  ×
                </button>
                <button
                  className="mt-1 text-[#0000ff] underline text-base block"
                  onClick={e => { e.stopPropagation(); router.push('/login'); }}
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        )}

        <div
          onClick={handleClippyClick}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClippyClick(); } }}
          role="button"
          tabIndex={0}
          className="cursor-pointer hover:scale-110 transition-transform"
          title="Clippy - AI Form Assistant"
        >
          <img
            src="/clippy.png"
            alt="Clippy"
            width={80}
            height={50}
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}
