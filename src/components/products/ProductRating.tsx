import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number;
  showCount?: boolean;
  reviewsCount?: number;
  size?: "sm" | "md";
}

export function ProductRating({
  rating,
  showCount = true,
  reviewsCount,
  size = "sm",
}: ProductRatingProps) {
  // Normalize rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating || 0));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating - fullStars >= 0.3 && clampedRating - fullStars <= 0.7;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= clampedRating;
          return (
            <Star
              key={star}
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              )}
            />
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-slate-700">
          {clampedRating.toFixed(1)}
          {reviewsCount !== undefined && (
            <span className="font-normal text-slate-400 ml-1">
              ({reviewsCount})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
