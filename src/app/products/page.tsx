"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { Package, Sparkles, CheckCircle2 } from "lucide-react";

export default function ProductsPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Products Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.firstName || user?.username}</span>! Manage and browse your catalog.
            </p>
          </div>
        </div>

        {/* Placeholder ready for Stage 4 table */}
        <div className="glass-card rounded-2xl p-8 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Authentication Layer Verified!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Stage 3 authentication and route guards are active. The desktop table, mobile cards, and custom pagination will be built here in Stage 4.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
