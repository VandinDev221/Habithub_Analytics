'use client';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="h-8 w-12 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="h-64 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-5 w-56 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="h-64 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-10 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
