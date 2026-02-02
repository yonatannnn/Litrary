'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Edit, Loader2 } from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  workId: string;
}

export default function CommentSection({ workId }: CommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [workId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/works/${workId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token || !newComment.trim()) return;

    setLoading(true); // Set loading immediately
    try {
      const response = await fetch(`/api/works/${workId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !token || !replyContent.trim()) return;

    setSubmittingReplyId(parentId); // Set loading immediately
    try {
      const response = await fetch(`/api/works/${workId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token || !confirm('Delete this comment?')) return;

    setDeletingCommentId(commentId); // Set loading immediately
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
        Comments ({comments.length})
      </h3>

      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 resize-none text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{loading ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </form>
      )}

      {!user && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Please login to comment
        </p>
      )}

      <div className="space-y-4 sm:space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-3 sm:pl-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              {comment.user.avatar ? (
                <img
                  src={comment.user.avatar}
                  alt={comment.user.displayName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                  {comment.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                  <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">
                    {comment.user.displayName}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                  {comment.content}
                </p>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {user && (
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment._id ? null : comment._id
                        )
                      }
                      className="text-xs sm:text-sm text-primary-600 hover:text-primary-700"
                    >
                      Reply
                    </button>
                  )}
                  {user?._id === comment.user._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deletingCommentId === comment._id}
                      className="text-xs sm:text-sm text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {deletingCommentId === comment._id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <span>Delete</span>
                      )}
                    </button>
                  )}
                </div>

                {replyingTo === comment._id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 resize-none text-xs sm:text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleSubmitReply(comment._id)}
                        disabled={submittingReplyId === comment._id || !replyContent.trim()}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors flex items-center space-x-1"
                      >
                        {submittingReplyId === comment._id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Replying...</span>
                          </>
                        ) : (
                          <span>Reply</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 ml-2 sm:ml-4">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-2 sm:pl-4">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          {reply.user.avatar ? (
                            <img
                              src={reply.user.avatar}
                              alt={reply.user.displayName}
                              className="w-6 h-6 rounded-full ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {reply.user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-50">
                                {reply.user.displayName}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDistanceToNow(new Date(reply.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {reply.content}
                            </p>
                            {user?._id === reply.user._id && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                disabled={deletingCommentId === reply._id}
                                className="mt-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                {deletingCommentId === reply._id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <span>Delete</span>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-slate-500 dark:text-slate-400 py-6 sm:py-8 text-sm sm:text-base">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}

