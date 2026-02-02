import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { Rating } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rating } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if work exists
    const work = await db
      .collection('works')
      .findOne({ _id: new ObjectId(params.id) });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Check if user already rated this work
    const existingRating = await db.collection<Rating>('ratings').findOne({
      workId: params.id,
      userId,
    });

    if (existingRating) {
      // Update existing rating
      await db.collection('ratings').updateOne(
        { _id: new ObjectId(existingRating._id as string) },
        {
          $set: {
            rating,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new rating
      const newRating: Omit<Rating, '_id'> = {
        workId: params.id,
        userId,
        rating,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('ratings').insertOne(newRating as any);
    }

    // Recalculate average rating for the work
    const ratings = await db
      .collection('ratings')
      .find({ workId: params.id })
      .toArray();

    const totalRatings = ratings.length;
    const averageRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await db.collection('works').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          averageRating: Math.round(averageRating * 100) / 100,
          totalRatings,
        },
      }
    );

    // Update writer score for the author
    const { calculateWriterScore } = await import('@/lib/writerScore');
    await calculateWriterScore(work.authorId);

    return NextResponse.json({
      rating: existingRating
        ? { ...existingRating, rating, updatedAt: new Date() }
        : { workId: params.id, userId, rating },
      averageRating: Math.round(averageRating * 100) / 100,
      totalRatings,
    });
  } catch (error) {
    console.error('Rate work error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(req);
    const db = await getDb();

    const ratings = await db
      .collection('ratings')
      .find({ workId: params.id })
      .toArray();

    const userRating = userId
      ? await db.collection('ratings').findOne({
          workId: params.id,
          userId,
        })
      : null;

    return NextResponse.json({
      ratings: ratings.map((r) => ({
        ...r,
        _id: r._id.toString(),
      })),
      userRating: userRating
        ? {
            ...userRating,
            _id: userRating._id.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

