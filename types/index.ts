export interface User {
  _id?: string;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  writerScore?: number;
  averageRating?: number;
  totalWorks?: number;
}

export interface Work {
  _id?: string;
  authorId: string;
  title: string;
  content: string;
  type: 'poem' | 'short-story';
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number;
  totalRatings?: number;
  totalComments?: number;
}

export interface Rating {
  _id?: string;
  workId: string;
  userId: string;
  rating: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: string;
  workId: string;
  userId: string;
  content: string;
  parentId?: string; // For nested replies
  createdAt: Date;
  updatedAt: Date;
}

export interface Follow {
  _id?: string;
  followerId: string; // User who follows
  followingId: string; // User being followed
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  username: string;
}

