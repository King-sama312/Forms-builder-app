'use client';

import { Win98Window } from '~/components/win98-window';
import { LoginForm } from '~/components/auth/login-form';

export default function LoginPage() {
  return (
    <Win98Window
      title="Login"
      defaultPosition={{ x: 200, y: 150, width: 380, height: 260 }}
    >
      <div className="flex flex-col h-full">
        <p className="text-sm mb-4">
          Enter your credentials to access the Form Builder.
        </p>
        <LoginForm />
      </div>
    </Win98Window>
  );
}