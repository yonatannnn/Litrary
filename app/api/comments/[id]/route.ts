import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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

    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const comment = await db
      .collection('comments')
      .findOne({ _id: new ObjectId(params.id) });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await db.collection('comments').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          content: content.trim(),
          updatedAt: new Date(),
        },
      }
    );

    const updatedComment = await db
      .collection('comments')
      .findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({
      comment: {
        ...updatedComment,
        _id: updatedComment?._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update comment error:', error);
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
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const comment = await db
      .collection('comments')
      .findOne({ _id: new ObjectId(params.id) });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete comment and all replies
    await db.collection('comments').deleteMany({
      $or: [
        { _id: new ObjectId(params.id) },
        { parentId: params.id },
      ],
    });

    // Update comment count for the work
    const commentCount = await db
      .collection('comments')
      .countDocuments({ workId: comment.workId });

    await db.collection('works').updateOne(
      { _id: new ObjectId(comment.workId) },
      {
        $set: {
          totalComments: commentCount,
        },
      }
    );

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

