'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api, type Analytics, type AIInsights, type AIAskResponse } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { Sparkles, Download, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { AnalyticsSkeleton } from '@/components/AnalyticsSkeleton';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api<Analytics>('/api/analytics', { useProxy: true }),
    enabled: status === 'authenticated',
  });
  const { data: insights, isLoading: loadingInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () =>
      api<AIInsights>('/api/ai/insights', { method: 'POST', useProxy: true }),
    enabled: status === 'authenticated',
  });

  const [question, setQuestion] = useState('');
  const askMutation = useMutation({
    mutationFn: (q: string) =>
      api<AIAskResponse>('/api/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question: q }),
        useProxy: true,
      }),
  });

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  const stats = analytics?.stats ?? {
    totalHabits: 0,
    totalCompleted: 0,
    successRate: 0,
    currentStreak: 0,
  };
  const categories = analytics?.categories ?? [];
  const logsByHabit = analytics?.logsByHabit ?? {};

  const lineData: { date: string; completions: number }[] = [];
  const last30 = 30;
  for (let i = last30 - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    let completions = 0;
    for (const arr of Object.values(logsByHabit)) {
      const log = arr.find((l) => l.date === d);
      if (log?.completed) completions++;
    }
    lineData.push({ date: format(subDays(new Date(), i), 'dd/MM'), completions });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
        <a
          href="/api/proxy/export/csv"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          style={{ pointerEvents: status === 'authenticated' ? 'auto' : 'none' }}
          onClick={(e) => {
            e.preventDefault();
            if (status !== 'authenticated') return;
            fetch('/api/proxy/export/csv', { credentials: 'include' })
              .then((r) => r.blob())
              .then((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'habithub-export.csv';
                a.click();
              });
          }}
        >
          <Download className="w-5 h-5" /> Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Hábitos" value={stats.totalHabits} />
        <StatCard label="Streak" value={stats.currentStreak} />
        <StatCard label="Taxa de sucesso" value={`${stats.successRate}%`} />
        <StatCard label="Check-ins" value={stats.totalCompleted} />
      </div>

      {lineData.some((d) => d.completions > 0) && (
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Progresso (últimos 30 dias)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                <XAxis dataKey="date" className="text-xs" stroke="currentColor" />
                <YAxis className="text-xs" stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="completions" stroke="#3B82F6" strokeWidth={2} name="Conclusões" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Hábitos por categoria</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, count }) => `${name} (${count})`}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Insights com IA
        </h2>
        {loadingInsights ? (
          <p className="text-slate-500">Gerando insights...</p>
        ) : insights ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Probabilidade estimada de sucesso: <strong>{insights.successProbability}%</strong>
              {insights.bestDay && ` • Melhor dia: ${insights.bestDay}`}
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
              {insights.insights.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-slate-500">
            Cadastre hábitos e faça check-ins para receber insights.
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" /> Pergunte sobre seus hábitos
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Faça uma pergunta em linguagem natural. A IA usa seus hábitos e histórico dos últimos 30 dias para responder.
        </p>
        <div className="flex gap-2 flex-col sm:flex-row">
          <textarea
            placeholder="Ex: Por que falho mais às sextas? Qual hábito devo priorizar?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
            rows={2}
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={askMutation.isPending}
          />
          <button
            type="button"
            onClick={() => {
              const q = question.trim();
              if (q) askMutation.mutate(q);
            }}
            disabled={!question.trim() || askMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {askMutation.isPending ? (
              '...'
            ) : (
              <>
                <Send className="w-4 h-4" /> Enviar
              </>
            )}
          </button>
        </div>
        {askMutation.isError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {askMutation.error instanceof Error ? askMutation.error.message : 'Erro ao enviar pergunta.'}
          </p>
        )}
        {askMutation.data?.answer && (
          <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {askMutation.data.answer}
            </p>
          </div>
        )}
      </div>

      <Link
        href="/dashboard"
        className="inline-block px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
