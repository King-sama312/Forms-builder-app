'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Win98Window } from '~/components/win98-window';
import { BootScreen } from '~/components/boot-screen';
import { useGetUserInfo } from '~/hooks/api/auth/index';

const STORAGE_KEY = 'win98-booted';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useGetUserInfo();
  const [booted, setBooted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });
  const [showWelcome, setShowWelcome] = useState(true);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setBooted(true);
  }, []);

  const ready = booted && !isLoading;

  if (!ready) {
    if (booted) return null;
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  if (!showWelcome) {
    return null;
  }

  return (
    <Win98Window
      title={user ? `Welcome, ${user.email ?? 'User'}` : 'Welcome to Windows 98'}
      defaultPosition={{ x: 160, y: 100, width: 420, height: 280 }}
      onClose={() => setShowWelcome(false)}
    >
      <div className="flex flex-col gap-3">
        {user ? (
          <>
            <p className="text-sm">
              Welcome to Windows 98 Form Builder.{' '}
              You are logged in as <strong>{user.email}</strong>.
            </p>
            <div className="border-t border-[#808080] my-1" />
            <div className="flex flex-col gap-1">
              <button
                className="text-left text-xs underline text-blue-800 cursor-pointer"
                onClick={() => router.push('/forms')}
              >
                Open My Forms
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">
              Welcome to Windows 98 Form Builder.{' '}
              Please register or login to get started.
            </p>
            <div className="border-t border-[#808080] my-1" />
            <div className="flex flex-col gap-1">
              <button
                className="text-left text-xs underline text-blue-800 cursor-pointer"
                onClick={() => router.push('/login')}
              >
                Login
              </button>
              <button
                className="text-left text-xs underline text-blue-800 cursor-pointer"
                onClick={() => router.push('/signup')}
              >
                Register
              </button>
            </div>
          </>
        )}
        <div className="border-t border-[#808080] my-1" />
        <div className="text-xs text-gray-600">
          <p>System Information:</p>
          <ul className="list-disc ml-4 mt-1">
            <li>Next.js App Router</li>
            <li>tRPC Backend</li>
            <li>Windows 98 Theme</li>
          </ul>
        </div>
      </div>
    </Win98Window>
  );
}
