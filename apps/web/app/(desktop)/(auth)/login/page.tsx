'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '~/components/auth/login-form';
import { useWindowManager } from '~/components/windows-context';

function LoginWindowContent() {
  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4">
        Enter your credentials to access the Form Builder.
      </p>
      <LoginForm />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { openWindow } = useWindowManager();

  const onClose = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    openWindow('login', 'Login', <LoginWindowContent />, { x: 200, y: 150, width: 380, height: 260 }, onClose, false);

    return () => {
      // noop
    };
  }, [openWindow, onClose]);

  return null;
}
