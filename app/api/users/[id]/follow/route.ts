import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { Follow } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followerId = await getUserIdFromRequest(req);

    if (!followerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (followerId === params.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user exists
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(params.id) });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await db.collection<Follow>('follows').findOne({
      followerId,
      followingId: params.id,
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow: Omit<Follow, '_id'> = {
      followerId,
      followingId: params.id,
      createdAt: new Date(),
    };

    await db.collection('follows').insertOne(follow as any);

    return NextResponse.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Follow user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followerId = await getUserIdFromRequest(req);

    if (!followerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();

    const result = await db.collection('follows').deleteOne({
      followerId,
      followingId: params.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Not following this user' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

