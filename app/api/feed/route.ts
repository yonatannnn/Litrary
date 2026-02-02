import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'global' or 'following'
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const db = await getDb();

    let query: any = {};

    // If following feed, only show works from followed users
    if (type === 'following' && userId) {
      const following = await db
        .collection('follows')
        .find({ followerId: userId })
        .toArray();

      const followingIds = following.map((f) => f.followingId);
      if (followingIds.length > 0) {
        query.authorId = { $in: followingIds };
      } else {
        // User follows no one, return empty feed
        return NextResponse.json({ works: [] });
      }
    }

    // Get works
    const works = await db
      .collection('works')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Populate author info and calculate trending score
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

        // Calculate trending score (recent works with high ratings get boost)
        const daysSinceCreation =
          (Date.now() - new Date(work.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const trendingScore =
          (work.averageRating || 0) * (work.totalRatings || 0) -
          daysSinceCreation * 0.1;

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
          trendingScore,
        };
      })
    );

    // Sort by trending score if global feed
    if (type === 'global') {
      worksWithAuthors.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    return NextResponse.json({ works: worksWithAuthors });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

