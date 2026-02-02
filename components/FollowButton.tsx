'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserMinus } from 'lucide-react';

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

    setLoading(true);
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
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
          : 'bg-primary-600 text-white hover:bg-primary-700'
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}

