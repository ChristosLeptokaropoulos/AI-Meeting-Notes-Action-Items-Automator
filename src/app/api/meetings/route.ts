import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        *,
        action_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch meetings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ meetings });
  } catch (error) {
    console.error('Meetings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
