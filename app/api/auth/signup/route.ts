import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { username, displayName, email, password } = await req.json();

    if (!username || !displayName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user: User = {
      username,
      displayName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      writerScore: 0,
      averageRating: 0,
      totalWorks: 0,
    };

    const result = await db.collection('users').insertOne(user);

    // Generate token
    const token = generateToken({
      userId: result.insertedId.toString(),
      username: user.username,
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        user: {
          ...userWithoutPassword,
          _id: result.insertedId.toString(),
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

