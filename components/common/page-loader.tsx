import React from 'react';

export function PageLoader({
  message = 'Loading page data...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] gap-3">
      <div className="h-12 w-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-800">
        <img
          src="/logo.png"
          alt="Kuber Plywood"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="h-1.5 w-36 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-red-600 animate-pulse" />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}
