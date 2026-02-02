import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  
  const payload = verifyToken(token);
  return payload?.userId || null;
}

