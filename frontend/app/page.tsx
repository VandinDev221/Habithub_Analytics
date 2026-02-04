'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Habithub Analytics
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8 text-center max-w-md">
        Rastreie hábitos, visualize analytics e receba insights com IA.
      </p>
      {status === 'loading' ? (
        <div className="h-12 w-32 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
      ) : session ? (
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
        >
          Ir para o Dashboard
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cadastrar
          </Link>
        </div>
      )}
    </div>
  );
}
