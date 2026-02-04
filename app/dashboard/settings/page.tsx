'use client';

import { useSession } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';
import { User, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Configurações</h1>

      <section className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Perfil
        </h2>
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 text-2xl font-medium">
              {(session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {session?.user?.name ?? 'Sem nome'}
            </p>
            <p className="text-sm text-slate-500">{session?.user?.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Aparência</h2>
        <p className="text-sm text-slate-500 mb-3">Tema</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              theme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              theme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Moon className="w-4 h-4" /> Escuro
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              theme === 'system'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-4 h-4" /> Sistema
          </button>
        </div>
      </section>
    </div>
  );
}
