'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api, type Analytics } from '@/lib/api';
import { format, subDays } from 'date-fns';
import { Calendar, TrendingUp, Target, Zap } from 'lucide-react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api<Analytics>('/api/analytics', { useProxy: true }),
    enabled: status === 'authenticated',
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Erro ao carregar dados. <Link href="/dashboard/habits" className="underline">Cadastre hábitos</Link> primeiro.
      </div>
    );
  }

  const stats = data?.stats ?? {
    totalHabits: 0,
    totalCompleted: 0,
    successRate: 0,
    currentStreak: 0,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <Target className="w-8 h-8 text-primary-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalHabits}</p>
          <p className="text-sm text-slate-500">Hábitos</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <Zap className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.currentStreak}</p>
          <p className="text-sm text-slate-500">Streak atual</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.successRate}%</p>
          <p className="text-sm text-slate-500">Taxa de sucesso</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <Calendar className="w-8 h-8 text-violet-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalCompleted}</p>
          <p className="text-sm text-slate-500">Check-ins</p>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Calendário (últimos 90 dias)</h2>
        <CalendarGrid logsByHabit={data?.logsByHabit ?? {}} />
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard/habits"
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          Gerenciar hábitos
        </Link>
        <Link
          href="/dashboard/analytics"
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Ver analytics
        </Link>
      </div>
    </div>
  );
}

function CalendarGrid({ logsByHabit }: { logsByHabit: Record<string, { date: string; completed: boolean }[]> }) {
  const days = 90;
  const cells: { date: string; count: number; total: number }[] = [];
  const habitIds = Object.keys(logsByHabit);
  const totalHabits = habitIds.length || 1;
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
    let count = 0;
    for (const hid of habitIds) {
      const log = logsByHabit[hid].find((l) => l.date === d);
      if (log?.completed) count++;
    }
    cells.push({ date: d, count, total: totalHabits });
  }
  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((c) => (
        <div
          key={c.date}
          title={`${c.date}: ${c.count}/${c.total}`}
          className="w-3 h-3 rounded-sm transition-colors"
          style={{
            backgroundColor:
              c.total === 0
                ? 'var(--border)'
                : `rgb(59 130 246 / ${0.2 + (c.count / maxCount) * 0.8})`,
          }}
        />
      ))}
    </div>
  );
}
