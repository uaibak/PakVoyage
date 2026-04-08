'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAdminToken, getAdminToken, loginAdmin, setAdminToken } from '@/lib/admin-auth';

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await loginAdmin(username, password);
      setAdminToken(response.token);
      router.replace('/admin');
    } catch (requestError) {
      clearAdminToken();
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not sign in to admin portal.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="premium-card mx-auto max-w-xl p-8 md:p-10">
      <p className="eyebrow">Admin access</p>
      <h1 className="mt-4 text-4xl text-slate-950 [font-family:var(--font-heading)]">
        Sign in to admin portal
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-700">
        Enter your admin credentials to manage destinations, packages, and booking operations.
      </p>

      <div className="mt-6 space-y-3">
        <input
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Admin username"
          className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Admin password"
          className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--emerald)]"
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="cta-primary mt-6 w-full justify-center disabled:opacity-60"
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
