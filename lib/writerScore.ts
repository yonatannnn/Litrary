import { getDb } from './mongodb';
import { Work, Rating } from '@/types';
import { ObjectId } from 'mongodb';

export async function calculateWriterScore(userId: string): Promise<{
  writerScore: number;
  averageRating: number;
  totalWorks: number;
}> {
  const db = await getDb();
  
  // Get all works by the user
  const works = await db.collection<Work>('works')
    .find({ authorId: userId })
    .toArray();
  
  const totalWorks = works.length;
  
  if (totalWorks === 0) {
    return {
      writerScore: 0,
      averageRating: 0,
      totalWorks: 0,
    };
  }
  
  // Get all ratings for user's works
  const workIds = works.map(w => w._id?.toString() || '');
  const ratings = await db.collection<Rating>('ratings')
    .find({ workId: { $in: workIds } })
    .toArray();
  
  // Calculate average rating
  const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
  
  // Calculate writer score: averageRating × log10(totalWorks + 1)
  const writerScore = averageRating * Math.log10(totalWorks + 1);
  
  // Update user document
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        writerScore: Math.round(writerScore * 100) / 100,
        averageRating: Math.round(averageRating * 100) / 100,
        totalWorks,
      },
    }
  );
  
  return {
    writerScore: Math.round(writerScore * 100) / 100,
    averageRating: Math.round(averageRating * 100) / 100,
    totalWorks,
  };
}

