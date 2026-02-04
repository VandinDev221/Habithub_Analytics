'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';
import { LayoutDashboard, Target, BarChart3, Settings, LogOut, Sun, Moon } from 'lucide-react';

export function DashboardNav() {
  const { data: session, status } = useSession();
  const { setTheme, resolved } = useTheme();
  const user = session?.user;
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-semibold text-slate-800 dark:text-slate-100">
          Habithub
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard/habits"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Hábitos"
          >
            <Target className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard/analytics"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard/settings"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            title={resolved === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {resolved === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </nav>
        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : user?.image ? (
            <img
              src={user.image}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-sm font-medium">
              {(user?.name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </span>
          )}
          <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
            {status === 'loading' ? '...' : (user?.name ?? user?.email ?? '')}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
