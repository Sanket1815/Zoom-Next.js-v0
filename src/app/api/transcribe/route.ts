import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, summarizeMeeting, extractActionItems } from '@/lib/openai';

// In-memory storage for transcriptions (in production, use a database)
const transcriptions: { [key: string]: any } = {};

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, meetingId, recordingId } = await request.json();
    
    if (!audioUrl || !meetingId) {
      return NextResponse.json(
        { error: 'Audio URL and meeting ID are required' },
        { status: 400 }
      );
    }

    // Transcribe the audio
    const transcription = await transcribeAudio(audioUrl, meetingId);
    
    // Generate summary and action items
    const [summary, actionItems] = await Promise.all([
      summarizeMeeting(transcription.text),
      extractActionItems(transcription.text)
    ]);

    const enrichedTranscription = {
      ...transcription,
      summary,
      actionItems,
      recordingId
    };

    // Store transcription (in production, save to database)
    transcriptions[`${meetingId}_${recordingId}`] = enrichedTranscription;

    return NextResponse.json(enrichedTranscription);
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}