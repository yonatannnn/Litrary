import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { Comment } from '@/types';

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

    const { content, parentId } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
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

    // Create comment
    const comment: Omit<Comment, '_id'> = {
      workId: params.id,
      userId,
      content: content.trim(),
      parentId: parentId || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('comments').insertOne(comment as any);

    // Update comment count
    const commentCount = await db
      .collection('comments')
      .countDocuments({ workId: params.id });

    await db.collection('works').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          totalComments: commentCount,
        },
      }
    );

    // Get user info for the comment
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    return NextResponse.json(
      {
        comment: {
          ...comment,
          _id: result.insertedId.toString(),
          user: user
            ? {
                _id: user._id.toString(),
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
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
    const db = await getDb();

    const comments = await db
      .collection('comments')
      .find({ workId: params.id, parentId: { $exists: false } })
      .sort({ createdAt: 1 })
      .toArray();

    // Get user info and replies for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment: any) => {
        const user = await db
          .collection('users')
          .findOne({ _id: comment.userId });

        // Get replies
        const replies = await db
          .collection('comments')
          .find({ parentId: comment._id.toString() })
          .sort({ createdAt: 1 })
          .toArray();

        const repliesWithUsers = await Promise.all(
          replies.map(async (reply: any) => {
            const replyUser = await db
              .collection('users')
              .findOne({ _id: reply.userId });
            return {
              ...reply,
              _id: reply._id.toString(),
              user: replyUser
                ? {
                    _id: replyUser._id.toString(),
                    username: replyUser.username,
                    displayName: replyUser.displayName,
                    avatar: replyUser.avatar,
                  }
                : null,
            };
          })
        );

        return {
          ...comment,
          _id: comment._id.toString(),
          user: user
            ? {
                _id: user._id.toString(),
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
              }
            : null,
          replies: repliesWithUsers,
        };
      })
    );

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

