import OpenAI from 'openai';
import { ExtractionResponse } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert meeting analyst for a large pharmaceutical organisation. 
Your job is to extract actionable information from meeting transcripts.

You MUST return valid JSON in this exact format:
{
  "summary": "A 2-3 sentence summary of the meeting's key outcomes",
  "action_items": [
    {
      "task": "Clear, specific description of what needs to be done",
      "owner": "Person responsible (use the name mentioned, or 'Unassigned' if unclear)",
      "deadline": "Deadline mentioned (use exact date if given, or relative like 'End of week', or 'Not specified')",
      "priority": "high | medium | low (infer from context, urgency cues, and business impact)"
    }
  ]
}

Rules:
- Extract EVERY actionable task, no matter how small
- If someone says "I'll do X" or "Can you handle Y" — that's an action item
- If a decision was made that requires follow-up — that's an action item
- Infer priority from language: "urgent", "ASAP", "critical" = high; "when you get a chance", "nice to have" = low
- Be specific in task descriptions — vague tasks are useless
- If no action items exist, return an empty array
- Always return valid JSON, nothing else`;

export async function extractActionItems(transcript: string): Promise<ExtractionResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Extract all action items from this meeting transcript:\n\n${transcript}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 4096,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  return JSON.parse(content) as ExtractionResponse;
}