import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  onRatingChange,
  interactive = true,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const currentDisplay = hoverRating || rating;

  const ratingDescriptions = {
    1: 'Poor / Needs Improvement',
    2: 'Fair / Below Expectations',
    3: 'Good / Met Expectations',
    4: 'Very Good / Helpful',
    5: 'Exceptional / Transformed My Path',
  };

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentDisplay;
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`transition-transform focus:outline-none ${
                interactive
                  ? 'cursor-pointer hover:scale-115 active:scale-95'
                  : 'cursor-default pointer-events-none'
              } p-0.5`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                    : 'text-zinc-700 hover:text-zinc-500'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && currentDisplay > 0 && (
        <span className="text-xs text-amber-300/90 font-medium animate-fade-in">
          {ratingDescriptions[currentDisplay] || `${currentDisplay} / 5 Stars`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
