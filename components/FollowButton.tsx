'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange: (following: boolean) => void;
}

export default function FollowButton({
  userId,
  isFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!token) {
      alert('Please login to follow users');
      return;
    }

    setLoading(true); // Set loading immediately
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
          : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>{loading ? (isFollowing ? 'Unfollowing...' : 'Following...') : (isFollowing ? 'Unfollow' : 'Follow')}</span>
    </button>
  );
}

