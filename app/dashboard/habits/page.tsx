'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api, type Habit } from '@/lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { HabitsSkeleton } from '@/components/HabitsSkeleton';

const MOODS = [
  { value: 'happy', label: '😊' },
  { value: 'neutral', label: '😐' },
  { value: 'sad', label: '😢' },
];

export default function HabitsPage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: '', color: '#3B82F6', goal: 'daily' });

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => api<Habit[]>('/api/habits', { useProxy: true }),
    enabled: status === 'authenticated',
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; category?: string; color?: string; goal?: string }) =>
      api('/api/habits', { method: 'POST', body: JSON.stringify(body), useProxy: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
      setForm({ name: '', category: '', color: '#3B82F6', goal: 'daily' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Habit> }) =>
      api(`/api/habits/${id}`, { method: 'PUT', body: JSON.stringify(body), useProxy: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/habits/${id}`, { method: 'DELETE', useProxy: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMutation.mutate({
      name: form.name.trim(),
      category: form.category.trim() || undefined,
      color: form.color,
      goal: form.goal,
    });
  };

  if (isLoading) {
    return <HabitsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hábitos</h1>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            createMutation.reset();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" /> Novo hábito
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-3"
        >
          {createMutation.isError && (
            <p className="text-sm text-red-500" role="alert">
              {createMutation.error instanceof Error ? createMutation.error.message : 'Erro ao criar hábito. Tente novamente.'}
            </p>
          )}
          <input
            type="text"
            placeholder="Nome do hábito"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            required
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Categoria"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <select
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            isEditing={editingId === habit.id}
            onEdit={() => setEditingId(editingId === habit.id ? null : habit.id)}
            onUpdate={(body) => updateMutation.mutate({ id: habit.id, body })}
            onDelete={() => deleteMutation.mutate(habit.id)}
          />
        ))}
      </div>
      {habits.length === 0 && !showForm && (
        <p className="text-center text-slate-500 py-8">
          Nenhum hábito ainda. Clique em &quot;Novo hábito&quot; para começar.
        </p>
      )}
    </div>
  );
}

function HabitCard({
  habit,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
}: {
  habit: Habit;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (body: Partial<Habit>) => void;
  onDelete: () => void;
}) {
  const queryClient = useQueryClient();
  const [editName, setEditName] = useState(habit.name);
  const [mood, setMood] = useState<string | null>(null);
  const logMutation = useMutation({
    mutationFn: (body: { date?: string; completed?: boolean; mood?: string }) =>
      api(`/api/habits/${habit.id}/log`, { method: 'POST', body: JSON.stringify(body), useProxy: true }),
    onSuccess: () => {
      setMood(null);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const handleCheck = (completed: boolean) => {
    logMutation.mutate({ date: today, completed, mood: mood ?? undefined });
  };

  return (
    <div
      className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
      style={{ borderLeftWidth: 4, borderLeftColor: habit.color }}
    >
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
            />
            <button
              type="button"
              onClick={() => onUpdate({ name: editName })}
              className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              title="Salvar"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">{habit.name}</h3>
              {habit.category && (
                <p className="text-sm text-slate-500">{habit.category}</p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 mb-2">Check-in hoje</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={clsx(
                  'px-2 py-1 rounded text-lg',
                  mood === m.value
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                title={m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleCheck(true)}
              disabled={logMutation.isPending}
              className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Concluído
            </button>
            <button
              type="button"
              onClick={() => handleCheck(false)}
              disabled={logMutation.isPending}
              className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Pular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
