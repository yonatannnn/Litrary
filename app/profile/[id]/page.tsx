'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import FollowButton from '@/components/FollowButton';
import WorkCard from '@/components/WorkCard';
import { Star, BookOpen, Users, Edit, X } from 'lucide-react';
import { Work } from '@/types/work';

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  bio?: string;
  writerScore?: number;
  averageRating?: number;
  totalWorks?: number;
}

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser, token } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAvatarModal(false);
      }
    };

    if (showAvatarModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showAvatarModal]);

  const fetchProfile = async () => {
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/users/${params.id}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.user);
        setWorks(data.works);
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-center text-gray-600 dark:text-gray-400">
          User not found
        </p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profileUser._id;

  return (
    <>
      {showAvatarModal && profileUser.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <button
            onClick={() => setShowAvatarModal(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={profileUser.avatar}
            alt={profileUser.displayName}
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 relative">
          {isOwnProfile && (
            <Link
              href={`/profile/${profileUser._id}/edit`}
              className="absolute top-4 right-4 p-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Edit Profile"
            >
              <Edit className="h-5 w-5" />
            </Link>
          )}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 mb-4 sm:mb-6">
            {profileUser.avatar ? (
              <img
                src={profileUser.avatar}
                alt={profileUser.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 cursor-pointer hover:ring-primary-500 transition-all"
                onClick={() => setShowAvatarModal(true)}
                title="Click to view full size"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-sm flex-shrink-0">
                {profileUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 truncate">
                {profileUser.displayName}
              </h1>
              {!isOwnProfile && currentUser && (
                <FollowButton
                  userId={profileUser._id}
                  isFollowing={isFollowing}
                  onFollowChange={(following) => {
                    setIsFollowing(following);
                    setFollowersCount((prev) =>
                      following ? prev + 1 : prev - 1
                    );
                  }}
                />
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              @{profileUser.username}
            </p>
          </div>
        </div>

        {profileUser.bio && (
          <p className="text-slate-700 dark:text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
            {profileUser.bio}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Writer Score
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {profileUser.writerScore?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Avg Rating
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {profileUser.averageRating?.toFixed(1) || '0.0'}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Works
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {profileUser.totalWorks || 0}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Followers
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {followersCount}
                </p>
              </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4 sm:mb-6">
          Published Works ({works.length})
        </h2>

        {works.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white dark:bg-slate-800 rounded-lg shadow px-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {isOwnProfile
                ? "You haven&apos;t published any works yet."
                : 'This user has not published any works yet.'}
            </p>
            {isOwnProfile && (
              <Link
                href="/create"
                className="mt-4 inline-block px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Create Your First Work
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {works.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

