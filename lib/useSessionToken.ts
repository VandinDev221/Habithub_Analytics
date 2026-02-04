'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function useSessionToken(): string | null {
  const { data, status } = useSession();
  const [fallbackToken, setFallbackToken] = useState<string | null>(null);

  const sessionToken = data?.accessToken ?? null;

  // Fallback: se está logado mas a sessão não tem accessToken, busca do servidor
  useEffect(() => {
    if (status !== 'authenticated' || sessionToken) {
      setFallbackToken(null);
      return;
    }
    let cancelled = false;
    fetch('/api/auth/backend-token', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.token) setFallbackToken(json.token);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, sessionToken]);

  return sessionToken ?? fallbackToken;
}
