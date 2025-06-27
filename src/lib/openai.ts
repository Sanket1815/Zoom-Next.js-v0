import OpenAI from 'openai';
import { Transcription } from '@/types/zoom';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioUrl: string, meetingId: string): Promise<Transcription> {
  try {
    // Download the audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error('Failed to download audio file');
    }
    
    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], 'recording.mp4', { type: 'audio/mp4' });
    
    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });
    
    // Process the transcription data
    const processedTranscription: Transcription = {
      id: `transcription_${meetingId}_${Date.now()}`,
      meetingId,
      text: transcription.text,
      segments: transcription.segments?.map((segment, index) => ({
        id: index,
        seek: segment.seek || 0,
        start: segment.start,
        end: segment.end,
        text: segment.text,
        tokens: segment.tokens || [],
        temperature: segment.temperature || 0,
        avg_logprob: segment.avg_logprob || 0,
        compression_ratio: segment.compression_ratio || 0,
        no_speech_prob: segment.no_speech_prob || 0
      })) || [],
      createdAt: new Date().toISOString(),
      duration: transcription.duration || 0
    };
    
    return processedTranscription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function summarizeMeeting(transcription: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes meeting transcriptions. Provide a concise summary highlighting key points, decisions made, and action items.'
        },
        {
          role: 'user',
          content: `Please summarize this meeting transcription:\n\n${transcription}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });
    
    return response.choices[0]?.message?.content || 'Unable to generate summary';
  } catch (error) {
    console.error('Error generating meeting summary:', error);
    throw new Error('Failed to generate meeting summary');
  }
}

export async function extractActionItems(transcription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts action items from meeting transcriptions. Return a JSON array of action items as strings.'
        },
        {
          role: 'user',
          content: `Please extract action items from this meeting transcription:\n\n${transcription}`
        }
      ],
      max_tokens: 300,
      temperature: 0.2
    });
    
    const content = response.choices[0]?.message?.content || '[]';
    try {
      return JSON.parse(content);
    } catch {
      // If JSON parsing fails, return the content as a single action item
      return [content];
    }
  } catch (error) {
    console.error('Error extracting action items:', error);
    return [];
  }
}