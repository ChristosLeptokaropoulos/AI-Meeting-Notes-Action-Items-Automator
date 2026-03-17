import { NextRequest, NextResponse } from 'next/server';
import { extractActionItems } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { title, transcript } = await req.json();

    // Validate input
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const meetingTitle = title || `Meeting — ${new Date().toLocaleDateString()}`;

    // Step 1: Call OpenAI to extract action items
    const extraction = await extractActionItems(transcript);

    // Step 2: Save the meeting to Supabase
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: meetingTitle,
        raw_transcript: transcript,
        summary: extraction.summary,
      })
      .select()
      .single();

    if (meetingError) {
      console.error('Failed to save meeting:', meetingError);
      return NextResponse.json(
        { error: 'Failed to save meeting to database' },
        { status: 500 }
      );
    }

    // Step 3: Save each action item linked to the meeting
    const actionItemsWithMeetingId = extraction.action_items.map((item) => ({
      meeting_id: meeting.id,
      task: item.task,
      owner: item.owner,
      deadline: item.deadline,
      priority: item.priority,
      status: 'pending' as const,
    }));

    let savedItems = [];

    if (actionItemsWithMeetingId.length > 0) {
      const { data, error: itemsError } = await supabase
        .from('action_items')
        .insert(actionItemsWithMeetingId)
        .select();

      if (itemsError) {
        console.error('Failed to save action items:', itemsError);
        return NextResponse.json(
          { error: 'Meeting saved but failed to save action items' },
          { status: 500 }
        );
      }

      savedItems = data || [];
    }

    // Step 4: Return the complete result
    return NextResponse.json({
      meeting,
      action_items: savedItems,
      summary: extraction.summary,
    });
  } catch (error) {
    console.error('Extraction failed:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    );
  }
}
