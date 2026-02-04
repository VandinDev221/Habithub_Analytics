const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Rotas de auth que devem ir pelo proxy no mesmo domínio (evita CORS). */
const AUTH_PROXY_PATHS: Record<string, string> = {
  '/api/auth/register': '/api/backend-auth/register',
  '/api/auth/login': '/api/backend-auth/login',
};

/**
 * useProxy: true = chama via /api/proxy/... (Next.js injeta o token do backend).
 * Use para todas as rotas autenticadas para evitar 401 por token no client.
 * Register e login usam automaticamente o proxy no mesmo domínio para evitar CORS.
 */
export async function api<T>(
  path: string,
  options: RequestInit & { token?: string; useProxy?: boolean } = {}
): Promise<T> {
  const { token, useProxy, ...init } = options;
  const proxyPath = AUTH_PROXY_PATHS[path];
  const useAuthProxy = typeof proxyPath === 'string';
  const baseUrl = useProxy || useAuthProxy ? '' : API_URL;
  const url = useProxy
    ? `/api/proxy/${path.replace(/^\/api\//, '')}`
    : useAuthProxy
      ? proxyPath
      : `${baseUrl}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (!useProxy && typeof token === 'string' && token.length > 50 && token.includes('.')) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  category?: string;
  color: string;
  goal: string;
  reminder_time?: string;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  mood?: string;
  notes?: string;
  created_at: string;
};

export type Analytics = {
  habits: Habit[];
  logsByHabit: Record<string, { date: string; completed: boolean; mood?: string }[]>;
  categories: { name: string; count: number }[];
  stats: {
    totalHabits: number;
    totalCompleted: number;
    successRate: number;
    currentStreak: number;
    from: string;
    to: string;
  };
};

export type AIInsights = {
  successProbability: number;
  insights: string[];
  bestDay: string | null;
};

export type AIAskResponse = {
  answer: string;
};
