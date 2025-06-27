import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for transcriptions (in production, use a database)
const transcriptions: { [key: string]: any } = {};

export async function GET(
  request: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingTranscriptions = Object.entries(transcriptions)
      .filter(([key]) => key.startsWith(params.meetingId))
      .reduce((acc, [key, value]) => {
        const recordingId = key.split('_')[1];
        acc[recordingId] = value;
        return acc;
      }, {} as { [key: string]: any });

    return NextResponse.json(meetingTranscriptions);
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcriptions' },
      { status: 500 }
    );
  }
}