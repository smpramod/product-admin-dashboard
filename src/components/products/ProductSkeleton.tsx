import React from "react";

export function ProductTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4">
      {/* Desktop Skeleton */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100 p-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-lg" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="h-16 w-16 rounded-xl bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
