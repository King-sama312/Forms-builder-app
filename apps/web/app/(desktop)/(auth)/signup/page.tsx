'use client';

import { Win98Window } from '~/components/win98-window';
import { RegisterForm } from '~/components/auth/register-form';

export default function SignupPage() {
  return (
    <Win98Window
      title="Register New User"
      defaultPosition={{ x: 220, y: 130, width: 400, height: 300 }}
    >
      <div className="flex flex-col h-full">
        <p className="text-sm mb-4">
          Create a new account to start building forms.
        </p>
        <RegisterForm />
      </div>
    </Win98Window>
  );
}