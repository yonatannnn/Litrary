import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { Work } from '@/types';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, type } = await req.json();

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    if (type !== 'poem' && type !== 'short-story') {
      return NextResponse.json(
        { error: 'Type must be "poem" or "short-story"' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const work: Omit<Work, '_id'> = {
      authorId: userId,
      title,
      content,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      averageRating: 0,
      totalRatings: 0,
      totalComments: 0,
    };

    const result = await db.collection('works').insertOne(work as any);

    // Update writer score
    const { calculateWriterScore } = await import('@/lib/writerScore');
    await calculateWriterScore(userId);

    return NextResponse.json(
      {
        work: {
          ...work,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create work error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const query: any = {};
    if (authorId) query.authorId = authorId;
    if (type) query.type = type;

    const works = await db
      .collection('works')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Populate author info
    const worksWithAuthors = await Promise.all(
      works.map(async (work) => {
        let author = null;
        try {
          if (work.authorId) {
            author = await db
              .collection('users')
              .findOne({ _id: new ObjectId(work.authorId) });
            if (!author) {
              console.warn(`Author not found for work ${work._id}, authorId: ${work.authorId}`);
            }
          }
        } catch (error) {
          console.error(`Error fetching author for work ${work._id}:`, error, `authorId: ${work.authorId}`);
          // Author will remain null if ObjectId conversion fails
        }
        return {
          ...work,
          _id: work._id.toString(),
          author: author
            ? {
                _id: author._id.toString(),
                username: author.username,
                displayName: author.displayName,
                avatar: author.avatar,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ works: worksWithAuthors });
  } catch (error) {
    console.error('Get works error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

