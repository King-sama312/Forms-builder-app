'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '~/components/auth/register-form';
import { useWindowManager } from '~/components/windows-context';

function SignupWindowContent() {
  return (
    <div className="flex flex-col h-full">
      <p className="text-sm mb-4">
        Create a new account to start building forms.
      </p>
      <RegisterForm />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { openWindow } = useWindowManager();

  const onClose = useCallback(() => {
    router.push('/');
  }, [router]);

  useEffect(() => {
    openWindow('signup', 'Register New User', <SignupWindowContent />, { x: 220, y: 130, width: 400, height: 300 }, onClose, false);

    return () => {
      // noop
    };
  }, [openWindow, onClose]);

  return null;
}
