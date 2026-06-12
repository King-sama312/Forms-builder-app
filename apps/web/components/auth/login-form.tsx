'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn } from '~/hooks/api/auth/index';
import { useWindowManager } from '~/components/windows-context';

export function LoginForm() {
  const router = useRouter();
  const { closeWindow } = useWindowManager();
  const { signInUserWithEmailAndPassword, isError, error, isPending } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInUserWithEmailAndPassword(
      { email, password },
      {
        onSuccess: () => {
          closeWindow('login');
          router.push('/');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="field-row-stacked">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 text-xs">
          {error?.message ?? 'Login failed'}
        </div>
      )}

      <div className="field-row justify-end gap-2 mt-2">
        <button type="button" onClick={() => router.push('/signup')}>
          Register
        </button>
        <button type="submit" disabled={isPending}>
          {isPending ? 'Please wait...' : 'Login'}
        </button>
      </div>
    </form>
  );
}