'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import RatingComponent from '@/components/RatingComponent';
import CommentSection from '@/components/CommentSection';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Work {
  _id: string;
  title: string;
  content: string;
  type: 'poem' | 'short-story';
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  totalRatings: number;
  totalComments: number;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  } | null;
}

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWork();
  }, [params.id]);

  const fetchWork = async () => {
    try {
      const response = await fetch(`/api/works/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setWork(data.work);
      }
    } catch (error) {
      console.error('Error fetching work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this work?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/works/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting work:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <p className="text-center text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Work not found
        </p>
      </div>
    );
  }

  if (!work.author) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <p className="text-center text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Author information not available
        </p>
      </div>
    );
  }

  const isAuthor = user?._id === work.author._id;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Link
        href="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to feed
      </Link>

      <article className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {work.author.avatar ? (
              <img
                src={work.author.avatar}
                alt={work.author.displayName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm sm:text-base font-semibold shadow-sm">
                {work.author.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <Link
                href={`/profile/${work.author._id}`}
                className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-50 hover:text-primary-600"
              >
                {work.author.displayName}
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                @{work.author.username}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              {work.type === 'poem' ? 'Poem' : 'Short Story'}
            </span>
            {isAuthor && (
              <>
                <Link
                  href={`/works/${work._id}/edit`}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3 sm:mb-4 leading-tight">
          {work.title}
        </h1>

        <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-6">
          Published {formatDistanceToNow(new Date(work.createdAt), { addSuffix: true })}
          {work.updatedAt !== work.createdAt && (
            <span className="hidden sm:inline"> • Updated {formatDistanceToNow(new Date(work.updatedAt), { addSuffix: true })}</span>
          )}
          {work.updatedAt !== work.createdAt && (
            <span className="sm:hidden block mt-1">Updated {formatDistanceToNow(new Date(work.updatedAt), { addSuffix: true })}</span>
          )}
        </div>

        {work.type === 'poem' ? (
          <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mb-6 sm:mb-8">
            <div 
              className="whitespace-pre-line leading-relaxed text-slate-900 dark:text-slate-50 font-serif text-sm sm:text-base lg:text-lg"
              style={{ 
                lineHeight: '1.8'
              }}
            >
              {work.content.replace(/\n{3,}/g, '\n\n')}
            </div>
          </div>
        ) : (
          <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mb-6 sm:mb-8">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {work.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <RatingComponent workId={work._id} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <CommentSection workId={work._id} />
        </div>
      </article>
    </div>
  );
}

