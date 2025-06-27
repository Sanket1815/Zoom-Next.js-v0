import { NextRequest, NextResponse } from 'next/server';
import { getMeetingRecordings } from '@/lib/zoom-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordings = await getMeetingRecordings(params.id);
    return NextResponse.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}