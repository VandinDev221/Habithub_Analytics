'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, BarChart3, Settings } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/habits', label: 'Hábitos', icon: Target, exact: false },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, exact: false },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="native-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <Icon className={clsx('w-6 h-6', active && 'scale-105')} strokeWidth={active ? 2.25 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
