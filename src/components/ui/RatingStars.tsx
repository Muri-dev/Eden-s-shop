import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  showText?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = "sm",
  interactive = false,
  onRatingChange,
  className,
  showText = false,
  reviewCount,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          const isHalf = rating >= starValue - 0.5 && rating < starValue;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              className={cn(
                "transition-transform",
                interactive && "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? "fill-[#C5A880] text-[#C5A880]"
                    : isHalf
                    ? "fill-[#DFC8A8] text-[#C5A880]"
                    : "text-[#D8CDBC]"
                )}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs text-[#63534B] font-medium">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-[#96867B] ml-1">({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}
