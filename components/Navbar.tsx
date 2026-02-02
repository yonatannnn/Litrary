'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { BookOpen, User, LogOut, Plus, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-500" />
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">Litrary</span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            {user ? (
              <>
                <Link
                  href="/"
                  className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:space-x-1 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Home"
                >
                  <Home className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">Home</span>
                </Link>
                <Link
                  href="/create"
                  className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:space-x-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm transition-colors"
                  title="Create"
                >
                  <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">Create</span>
                </Link>
                <Link
                  href={`/profile/${user._id}`}
                  className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:space-x-1 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Profile"
                >
                  <User className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">{user.displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:space-x-1 sm:px-3 sm:py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

