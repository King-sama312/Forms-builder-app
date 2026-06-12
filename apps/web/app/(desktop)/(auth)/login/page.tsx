'use client';

import { useEffect } from 'react';
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
  const { openWindow } = useWindowManager();

  useEffect(() => {
    openWindow('login', 'Login', <LoginWindowContent />, { x: 200, y: 150, width: 380, height: 260 });
  }, [openWindow]);

  return null;
}
