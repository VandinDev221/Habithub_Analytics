'use client';

export function HabitsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4"
          >
            <div className="flex justify-between mb-3">
              <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="flex gap-2 mb-2">
              <div className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-9 w-9 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
