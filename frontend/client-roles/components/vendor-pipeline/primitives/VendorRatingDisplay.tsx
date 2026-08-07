"use client";

import { Star, StarOff } from "lucide-react";

interface VendorRatingDisplayProps {
  rating: number;
  ratingCount?: number;
  showBadge?: boolean;
  size?: "sm" | "md";
}

const VendorRatingDisplay: React.FC<VendorRatingDisplayProps> = ({
  rating,
  ratingCount,
  showBadge = false,
  size = "md",
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  const isTopRated = rating >= 4.5;

  const starSize = size === "sm" ? 12 : 14;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={starSize}
            className="fill-amber-400 text-amber-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarOff size={starSize} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={starSize} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarOff key={`empty-${i}`} size={starSize} className="text-gray-300" />
        ))}
      </div>

      <span className={`font-bold text-[#021422] ${textSize}`}>{rating.toFixed(1)}</span>

      {ratingCount !== undefined && (
        <span className={`text-gray-400 ${textSize}`}>({ratingCount})</span>
      )}

      {showBadge && isTopRated && (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
          Top Rated
        </span>
      )}
    </div>
  );
};

export default VendorRatingDisplay;
