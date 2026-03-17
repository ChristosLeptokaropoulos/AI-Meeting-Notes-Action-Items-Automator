import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/whisper';

export const maxDuration = 60; // Allow up to 60s for Whisper processing on Vercel

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const result = await transcribeAudio(file);

    return NextResponse.json({
      transcript: result.transcript,
    });
  } catch (error: unknown) {
    console.error('Transcription failed:', error);
    const message = error instanceof Error ? error.message : 'Failed to transcribe audio';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
