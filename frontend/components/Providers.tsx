'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useState } from 'react';

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 min: não refetch se dados têm menos de 1 min
      gcTime: 5 * 60 * 1000,     // 5 min: mantém cache após desmontar
      refetchOnWindowFocus: false,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
