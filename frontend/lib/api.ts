const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const isProductionApi = API_URL.startsWith('https://');

/** Em produção, cadastro/login vão direto ao backend (evita 404 na rota /api/register da Vercel). Em dev, usam proxy no mesmo domínio. */
const AUTH_PROXY_PATHS: Record<string, string> = {
  '/api/auth/register': '/api/register',
  '/api/auth/login': '/api/login',
};

/**
 * useProxy: true = chama via /api/proxy/... (Next.js injeta o token do backend).
 * Register e login: em produção chamam o backend direto (NEXT_PUBLIC_API_URL); em dev usam /api/register e /api/login.
 */
export async function api<T>(
  path: string,
  options: RequestInit & { token?: string; useProxy?: boolean } = {}
): Promise<T> {
  const { token, useProxy, ...init } = options;
  const proxyPath = AUTH_PROXY_PATHS[path];
  const isAuthPath = typeof proxyPath === 'string';
  const useDirectBackend = isProductionApi && isAuthPath;
  const baseUrl = useProxy ? '' : useDirectBackend ? API_URL : isAuthPath ? '' : API_URL;
  const url = useProxy
    ? `/api/proxy/${path.replace(/^\/api\//, '')}`
    : useDirectBackend
      ? `${API_URL}${path}`
      : isAuthPath
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
    const msg = err.error ?? res.statusText;
    const hint =
      res.status === 404
        ? ' Na Vercel: Settings → Root Directory = frontend → Save → Redeploy. Depois teste: ' + (typeof window !== 'undefined' ? window.location.origin : '') + '/api/register (deve retornar JSON, não 404).'
        : res.status === 502 || res.status === 503
          ? ' Backend ou banco pode estar indisponível — confira Railway (DATABASE_URL e migrações) e NEXT_PUBLIC_API_URL.'
          : '';
    throw new Error(msg + hint);
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
