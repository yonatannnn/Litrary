'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

interface RatingComponentProps {
  workId: string;
}

export default function RatingComponent({ workId }: RatingComponentProps) {
  const { user, token } = useAuth();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [workId, token]);

  const fetchRatings = async () => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/works/${workId}/ratings`, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.userRating) {
          setUserRating(data.userRating.rating);
        }
        if (data.ratings && data.ratings.length > 0) {
          const avg =
            data.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) /
            data.ratings.length;
          setAverageRating(avg);
          setTotalRatings(data.ratings.length);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !token) {
      alert('Please login to rate works');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/works/${workId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserRating(rating);
        setAverageRating(data.averageRating);
        setTotalRatings(data.totalRatings);
      }
    } catch (error) {
      console.error('Error rating work:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
        Rate this work
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:space-x-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRating(rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={loading || !user}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Star
                className={`h-7 w-7 sm:h-8 sm:w-8 ${
                  rating <= (hoveredRating || userRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="sm:ml-4">
          {averageRating > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              No ratings yet
            </span>
          )}
        </div>
      </div>

      {!user && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Please login to rate this work
        </p>
      )}
    </div>
  );
}

