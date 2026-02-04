'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WorkCard from '@/components/WorkCard';
import { BookOpen, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { Work } from '@/types/work';

export default function Home() {
  const { user, token } = useAuth();
  const [works, setWorks] = useState<Work[]>([]);
  const [feedType, setFeedType] = useState<'global' | 'following'>('global');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);
  const PAGE_SIZE = 18;

  useEffect(() => {
    // Reset and load first page when feed type changes
    setWorks([]);
    setHasMore(true);
    fetchFeed({ reset: true });
  }, [feedType, token]);

  const fetchFeed = async ({ reset }: { reset: boolean }) => {
    const reqId = ++requestIdRef.current;
    const nextSkip = reset ? 0 : works.length;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const url = `/api/feed?type=${feedType}&limit=${PAGE_SIZE}&skip=${nextSkip}`;
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        // Ignore out-of-order responses (e.g., switching feedType quickly)
        if (reqId !== requestIdRef.current) return;
        const newWorks: Work[] = data.works || [];
        setHasMore(Boolean(data.hasMore));
        setWorks((prev) => (reset ? newWorks : [...prev, ...newWorks]));
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      if (reset) setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleToggleFeed = (type: 'global' | 'following') => {
    if (type === feedType) return;
    // Immediate feedback
    setLoading(true);
    setFeedType(type);
  };

  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore) return;
    await fetchFeed({ reset: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2 sm:mb-4">
          Welcome to Litrary
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Discover poems and short stories from talented writers around the world
        </p>
      </div>

      {user && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => handleToggleFeed('global')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
              feedType === 'global'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Global Feed
          </button>
          <button
            onClick={() => handleToggleFeed('following')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
              feedType === 'following'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Following
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {feedType === 'following'
              ? "You&apos;re not following anyone yet. Start following writers to see their works here!"
              : 'No works found. Be the first to publish!'}
          </p>
          {user && (
            <Link
              href="/create"
              className="mt-4 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Work
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {works.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>

          <div className="flex justify-center">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{loadingMore ? 'Loading...' : 'Load more'}</span>
              </button>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You&apos;ve reached the end.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

