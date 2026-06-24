'use client';

import { DashboardNav } from '@/components/DashboardNav';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useNativeApp } from '@/hooks/useNativeApp';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isNative = useNativeApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 native-dashboard-shell">
      {!isNative && <DashboardNav />}
      {isNative && (
        <header className="native-top-bar sticky top-0 z-10 flex h-12 items-center justify-center border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/95">
          <span className="text-base font-semibold text-slate-800 dark:text-slate-100">Habithub</span>
        </header>
      )}
      <main
        className={
          isNative
            ? 'native-main max-w-6xl mx-auto px-4 py-4'
            : 'max-w-6xl mx-auto px-4 py-6'
        }
      >
        {children}
      </main>
      {isNative && <MobileBottomNav />}
    </div>
  );
}
