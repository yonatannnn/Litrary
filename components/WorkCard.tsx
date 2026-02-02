'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Star, MessageCircle } from 'lucide-react';
import { Work } from '@/types/work';

interface WorkCardProps {
  work: Work;
}

export default function WorkCard({ work }: WorkCardProps) {
  const preview = work.content.substring(0, 250) + (work.content.length > 250 ? '...' : '');

  if (!work.author) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-slate-700 p-4 sm:p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              ?
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                Unknown Author
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                @unknown
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
            {work.type === 'poem' ? 'Poem' : 'Short Story'}
          </span>
        </div>

        <Link href={`/works/${work._id}`} className="flex-grow flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 sm:mb-3 line-clamp-2 leading-tight">
            {work.title}
          </h2>

          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 flex-grow line-clamp-4 sm:line-clamp-6 leading-relaxed">
            {preview}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {work.averageRating > 0
                    ? work.averageRating.toFixed(1)
                    : 'No ratings'}
                </span>
                {work.totalRatings > 0 && (
                  <span className="text-xs">({work.totalRatings})</span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{work.totalComments}</span>
              </div>
            </div>
            <span className="text-xs">
              {formatDistanceToNow(new Date(work.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 dark:border-slate-700 p-4 sm:p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/profile/${work.author._id}`}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {work.author.avatar ? (
            <img
              src={work.author.avatar}
              alt={work.author.displayName}
              className="w-8 h-8 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {work.author.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {work.author.displayName}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              @{work.author.username}
            </p>
          </div>
        </Link>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          {work.type === 'poem' ? 'Poem' : 'Short Story'}
        </span>
      </div>

      <Link href={`/works/${work._id}`} className="flex-grow flex flex-col">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 sm:mb-3 line-clamp-2 leading-tight">
          {work.title}
        </h2>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 flex-grow line-clamp-4 sm:line-clamp-6 leading-relaxed">
          {preview}
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>
                {work.averageRating > 0
                  ? work.averageRating.toFixed(1)
                  : 'No ratings'}
              </span>
              {work.totalRatings > 0 && (
                <span className="text-xs">({work.totalRatings})</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{work.totalComments}</span>
            </div>
          </div>
          <span className="text-xs">
            {formatDistanceToNow(new Date(work.createdAt), { addSuffix: true })}
          </span>
        </div>
      </Link>
    </div>
  );
}

