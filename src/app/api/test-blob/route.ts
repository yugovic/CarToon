import { NextResponse } from "next/server";
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const blob = await put('test.txt', 'Hello Vercel Blob!', {
      access: 'public',
    });
    
    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      message: 'Vercel Blob is working correctly'
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Vercel Blob is not configured'
    }, { status: 500 });
  }
}
