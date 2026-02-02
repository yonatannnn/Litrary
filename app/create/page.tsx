'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateWorkPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'poem' as 'poem' | 'short-story',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true); // Set loading immediately
    try {
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/works/${data.work._id}`);
      } else {
        setError(data.error || 'Failed to create work');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      <Link
        href="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to feed
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
          Create New Work
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm sm:text-base"
            >
              <option value="poem">Poem</option>
              <option value="short-story">Short Story</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm sm:text-base"
              placeholder="Enter the title of your work"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2"
            >
              Content (Markdown supported)
            </label>
            <textarea
              id="content"
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-mono text-xs sm:text-sm resize-y min-h-[300px] sm:min-h-[400px]"
              placeholder="Write your poem or short story here... You can use Markdown formatting."
            />
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              You can use Markdown syntax for formatting (bold, italic, links, etc.)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{loading ? 'Publishing...' : 'Publish'}</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto text-center px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

