import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/util/redis-cache';

export const runtime = 'edge'; // Use Edge Runtime for better performance

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    // Extract user identifier from headers for debouncing
    const userKey = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'anonymous';
    // Increment with debouncing to prevent spam
    await cacheManager.incrementViewWithDebounce(slug, userKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track view' }, 
      { status: 500 }
    );
  }
} 