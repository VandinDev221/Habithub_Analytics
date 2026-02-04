'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700 mb-3" />
            <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-5 w-56 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700"
              style={{ opacity: 0.5 + (i % 3) * 0.15 }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-28 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
