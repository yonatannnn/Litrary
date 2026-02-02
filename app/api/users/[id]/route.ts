import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = await getUserIdFromRequest(req);
    const db = await getDb();

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(params.id) });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's works
    const works = await db
      .collection('works')
      .find({ authorId: params.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate author info for each work (should be the profile user)
    const worksWithAuthors = await Promise.all(
      works.map(async (work) => {
        let author = null;
        try {
          if (work.authorId) {
            author = await db
              .collection('users')
              .findOne({ _id: new ObjectId(work.authorId) });
          }
        } catch (error) {
          console.error(`Error fetching author for work ${work._id}:`, error);
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

    // Get followers and following counts
    const followersCount = await db
      .collection('follows')
      .countDocuments({ followingId: params.id });

    const followingCount = await db
      .collection('follows')
      .countDocuments({ followerId: params.id });

    // Check if current user follows this user
    const isFollowing = currentUserId
      ? !!(await db.collection('follows').findOne({
          followerId: currentUserId,
          followingId: params.id,
        }))
      : false;

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        _id: user._id.toString(),
      },
      works: worksWithAuthors,
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    if (userId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { displayName, bio, avatar } = await req.json();
    const db = await getDb();

    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    const updatedUser = await db
      .collection('users')
      .findOne({ _id: new ObjectId(params.id) });

    const { password: _, ...userWithoutPassword } = updatedUser || {};

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        _id: updatedUser?._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

