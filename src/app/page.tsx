'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ActionItem } from '@/lib/types';

const SAMPLE_TRANSCRIPT = `Team sync — March 15, 2026

Sarah: Okay let's get started. First item — the Q2 campaign landing pages. Mark, where are we on those?

Mark: I've got the designs from the agency but they need review. I'll have feedback sent back by Wednesday.

Sarah: Great. Make that a priority, we need those live by end of month. Lisa, can you coordinate with legal on the compliance review? That's been blocking us for two weeks.

Lisa: Yes, I'll set up a meeting with the compliance team tomorrow morning. I also wanted to flag — we're still manually pulling the weekly engagement reports from three different platforms. It takes me about 4 hours every Monday.

Sarah: That's exactly the kind of thing we should automate. James, can you look into building a simple dashboard that pulls from our analytics APIs? Even a basic prototype would help.

James: Sure, I can have something rough by Friday. I'll use the marketing API endpoints we already have.

Sarah: Perfect. One more thing — the vendor contract with DigitalFirst is up for renewal next month. Someone needs to review the SOW and flag any concerns. Mark, can you own that?

Mark: Got it. I'll review by end of next week and circulate comments.

Sarah: Thanks everyone. Let's reconvene Thursday to check progress.`;

export default function Home() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function extractFromTranscript(meetingTitle: string, transcriptText: string) {
    setLoadingStatus('⏳ Extracting action items...');
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: meetingTitle, transcript: transcriptText }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to extract action items');
    }

    return response.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!transcript.trim()) {
      toast.error('Please paste a meeting transcript');
      return;
    }

    setLoading(true);
    setSummary('');
    setActionItems([]);
    setHasResults(false);

    try {
      const data = await extractFromTranscript(title, transcript);
      setSummary(data.summary);
      setActionItems(data.action_items || []);
      setHasResults(true);
      toast.success(`Extracted ${data.action_items?.length || 0} action items!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  }

  async function handleAudioSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    setLoading(true);
    setSummary('');
    setActionItems([]);
    setHasResults(false);

    try {
      // Phase 1: Transcribe with Whisper
      setLoadingStatus('🎙️ Transcribing audio...');
      const formData = new FormData();
      formData.append('audio', audioFile);

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) {
        const error = await transcribeRes.json();
        throw new Error(error.error || 'Failed to transcribe audio');
      }

      const { transcript: transcribedText } = await transcribeRes.json();
      setTranscript(transcribedText);

      // Phase 2: Extract action items
      const data = await extractFromTranscript(
        title || audioFile.name.replace(/\.[^/.]+$/, ''),
        transcribedText
      );
      setSummary(data.summary);
      setActionItems(data.action_items || []);
      setHasResults(true);
      toast.success(`Transcribed & extracted ${data.action_items?.length || 0} action items!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  }

  function loadSample() {
    setTitle('Team Sync — March 15, 2026');
    setTranscript(SAMPLE_TRANSCRIPT);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setAudioFile(e.dataTransfer.files[0]);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Paste a transcript or upload audio.</h2>
        <h2 className="text-3xl font-bold">Get action items in seconds.</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          AI extracts every task, assigns owners, sets priorities, and saves everything
          to your dashboard. No more lost follow-ups.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center gap-2">
        <Button
          variant={inputMode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('text')}
        >
          📝 Paste Transcript
        </Button>
        <Button
          variant={inputMode === 'audio' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('audio')}
        >
          🎙️ Upload Audio
        </Button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {inputMode === 'text' ? 'Meeting Transcript' : 'Audio Upload'}
          </CardTitle>
          <CardDescription>
            {inputMode === 'text' ? (
              <>
                Paste your meeting notes, transcript, or minutes below.{' '}
                <button onClick={loadSample} className="text-primary hover:underline">
                  Load sample transcript
                </button>
              </>
            ) : (
              'Upload an audio or video recording of your meeting. Drag & drop or click to browse. Supports MP3, MP4, WAV, M4A, WEBM, OGG (max 25MB).'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inputMode === 'text' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Meeting title (optional) — e.g. Team Sync — March 17"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Paste your meeting transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={12}
                className="resize-y font-mono text-sm"
              />
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> {loadingStatus || 'Extracting action items...'}
                  </span>
                ) : (
                  '⚡ Extract Action Items'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAudioSubmit} className="space-y-4">
              <Input
                placeholder="Meeting title (optional) — e.g. Team Sync — March 17"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : audioFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                      : 'hover:border-primary/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/mp4,video/webm,.mp3,.mp4,.wav,.m4a,.webm,.ogg"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
                {audioFile ? (
                  <div className="space-y-2">
                    <p className="text-2xl">🎵</p>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                      className="text-sm text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl">🎙️</p>
                    <p className="font-medium">Drop an audio or video file here, or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      MP3, MP4, WAV, M4A, WEBM, OGG — up to 25MB
                    </p>
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading || !audioFile} className="w-full" size="lg">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> {loadingStatus || 'Processing...'}
                  </span>
                ) : (
                  '🎙️ Transcribe & Extract'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {hasResults && (
        <div className="space-y-6">
          {/* Summary */}
          {summary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">📋 Meeting Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                ✅ Action Items ({actionItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No action items found in this transcript.
                </p>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{item.task}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>👤 {item.owner}</span>
                          <span>📅 {item.deadline}</span>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
