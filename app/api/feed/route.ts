import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';


export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'global' or 'following'
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    const db = await getDb();
    const now = new Date();

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
        return NextResponse.json({ works: [], hasMore: false });
      }
    }

    // Get works (with author lookup + trending score) in one aggregation.
    // Fetch one extra record to determine whether more pages exist.
    const worksPlusOne = await db
      .collection('works')
      .aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit + 1 },
        {
          $addFields: {
            authorObjId: {
              $convert: {
                input: '$authorId',
                to: 'objectId',
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { authorId: '$authorObjId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$authorId'] } } },
              { $project: { username: 1, displayName: 1, avatar: 1 } },
            ],
            as: 'author',
          },
        },
        {
          $addFields: {
            author: { $ifNull: [{ $first: '$author' }, null] },
            daysSinceCreation: {
              $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $addFields: {
            trendingScore: {
              $subtract: [
                {
                  $multiply: [
                    { $ifNull: ['$averageRating', 0] },
                    { $ifNull: ['$totalRatings', 0] },
                  ],
                },
                { $multiply: ['$daysSinceCreation', 0.1] },
              ],
            },
          },
        },
        { $project: { authorObjId: 0, daysSinceCreation: 0 } },
      ])
      .toArray();

    const hasMore = worksPlusOne.length > limit;
    const works = hasMore ? worksPlusOne.slice(0, limit) : worksPlusOne;
    const worksWithAuthors = works.map((work: any) => ({
      ...work,
      _id: work._id.toString(),
      author: work.author
        ? {
            ...work.author,
            _id: work.author._id.toString(),
          }
        : null,
    }));

    // NOTE: We intentionally do not re-sort by trendingScore here because it breaks
    // pagination consistency (sorting must happen before skip/limit).
    return NextResponse.json({ works: worksWithAuthors, hasMore });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
