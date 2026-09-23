import React from "react";
import { Package, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/60 py-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-white">
            <Package className="h-3 w-3" />
          </div>
          <span className="font-semibold text-slate-700">AdminPulse</span>
          <span>• Frontend Assignment: Product Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Powered by Next.js & DummyJSON API</span>
        </div>
      </div>
    </footer>
  );
}
