import OpenAI from 'openai';
import { TranscriptionResult } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_TYPES = [
  'audio/mpeg',       // .mp3
  'audio/mp4',        // .m4a
  'audio/wav',        // .wav
  'audio/x-wav',
  'audio/x-m4a',      // .m4a (alternate MIME)
  'audio/webm',       // .webm
  'audio/ogg',        // .ogg
  'video/mp4',        // .mp4 video (Whisper extracts audio track)
  'video/webm',       // .webm video
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB — Whisper's limit

export async function transcribeAudio(file: File): Promise<TranscriptionResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Supported: MP3, WAV, M4A, WEBM, OGG`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 25MB.`
    );
  }

  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: file,
    response_format: 'text',
    language: 'en',       // Optimize for English — faster and more accurate
  });

  // response is the transcript string when format is 'text'
  const transcript = typeof response === 'string' ? response : String(response);

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Whisper returned an empty transcription. The audio may be silent or unrecognizable.');
  }

  return {
    transcript: transcript.trim(),
    duration_seconds: null, // Whisper text format doesn't return duration
  };
}
