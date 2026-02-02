import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb();
    const work = await db
      .collection('works')
      .findOne({ _id: new ObjectId(params.id) });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    // Get author
    let author = null;
    try {
      author = await db
        .collection('users')
        .findOne({ _id: new ObjectId(work.authorId) });
    } catch (error) {
      console.error('Error fetching author:', error);
      // Author will remain null if ObjectId conversion fails
    }

    return NextResponse.json({
      work: {
        ...work,
        _id: work._id.toString(),
        author: author
          ? {
              _id: author._id.toString(),
              username: author.username,
              displayName: author.displayName,
              avatar: author.avatar,
              bio: author.bio,
              writerScore: author.writerScore,
              averageRating: author.averageRating,
              totalWorks: author.totalWorks,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get work error:', error);
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

    const db = await getDb();
    const work = await db
      .collection('works')
      .findOne({ _id: new ObjectId(params.id) });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (work.authorId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { title, content, type } = await req.json();
    const updateData: any = { updatedAt: new Date() };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (type) updateData.type = type;

    await db.collection('works').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    const updatedWork = await db
      .collection('works')
      .findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({
      work: {
        ...updatedWork,
        _id: updatedWork?._id.toString(),
      },
    });
  } catch (error) {
    console.error('Update work error:', error);
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
    const work = await db
      .collection('works')
      .findOne({ _id: new ObjectId(params.id) });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (work.authorId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete work and related data
    await db.collection('works').deleteOne({ _id: new ObjectId(params.id) });
    await db.collection('ratings').deleteMany({ workId: params.id });
    await db.collection('comments').deleteMany({ workId: params.id });

    // Update writer score
    const { calculateWriterScore } = await import('@/lib/writerScore');
    await calculateWriterScore(userId);

    return NextResponse.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Delete work error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

