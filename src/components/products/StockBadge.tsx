import React from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className }: StockBadgeProps) {
  const stockCount = Number(stock) || 0;

  if (stockCount <= 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200/80",
          className
        )}
      >
        <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
        Out of Stock
      </span>
    );
  }

  if (stockCount < 20) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/80",
          className
        )}
      >
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        Low: {stockCount} left
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80",
        className
      )}
    >
      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
      {stockCount} in stock
    </span>
  );
}
