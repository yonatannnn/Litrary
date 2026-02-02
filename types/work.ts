// Shared types for Work-related components

export interface WorkAuthor {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface Work {
  _id: string;
  title: string;
  content: string;
  type: 'poem' | 'short-story';
  createdAt: string;
  updatedAt?: string;
  averageRating: number;
  totalRatings: number;
  totalComments: number;
  author: WorkAuthor | null;
}

