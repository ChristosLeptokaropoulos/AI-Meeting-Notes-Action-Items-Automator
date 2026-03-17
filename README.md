# ⚡ Meeting Action Extractor — with Audio Transcription

**AI-powered tool that converts meeting transcripts — or audio recordings — into structured, trackable action items.**

> Paste a transcript or upload an audio/video file. OpenAI Whisper transcribes the recording, GPT-4o extracts every action item, and everything lands on a persistent dashboard. Built as a rapid prototype demonstrating how AI can eliminate the manual effort of processing meeting outcomes.

## 🔴 Live Demo

**[ai-meeting-notes-action-items-automator-8nooedz8m.vercel.app](https://ai-meeting-notes-action-items-automator-8nooedz8m.vercel.app)**

**Text mode:** Click **"Load sample transcript"** → **"⚡ Extract Action Items"**  
**Audio mode:** Switch to **"🎙️ Upload Audio"** → drag & drop an MP3/WAV/M4A file → **"🎙️ Transcribe & Extract"**

## 🎯 Problem Statement

Across large organisations, meeting outcomes get lost. Notes are taken inconsistently, action items are buried in paragraphs of text, and follow-up depends on someone manually parsing what was discussed. This results in:
- Missed deadlines due to unclear ownership
- Duplicated effort from poor visibility
- Hours spent weekly on manual note processing

## 💡 Solution

Paste a transcript **or upload an audio/video recording** → AI instantly extracts:
- **Structured action items** with clear task descriptions
- **Assigned owners** based on conversational context
- **Deadlines** (explicit or inferred)
- **Priority levels** based on urgency cues
- **Audio transcription** via OpenAI Whisper with full transcript shown for verification

All items persist to a filterable dashboard where status can be tracked over time. Each meeting is tagged with its source (📝 Pasted / 🎤 Audio) for full traceability.

## 🛠️ Tech Stack

| Technology | Role |
|---|---|
| **Next.js 16** (App Router, TypeScript) | Full-stack framework with server-side API routes |
| **Supabase** (PostgreSQL) | Database with Row-Level Security enabled |
| **OpenAI GPT-4o** | AI extraction with structured JSON output mode |
| **OpenAI Whisper** | Audio/video → text transcription (25MB limit) |
| **shadcn/ui + Tailwind CSS** | Accessible, professional UI components |
| **Vercel** | Deployment with automatic HTTPS and CI/CD |

## 🏗️ Architecture

```
Text input:                          Audio input:
User pastes transcript               User uploads audio/video file
    │                                    │
    │                                    → /api/transcribe
    │                                    → OpenAI Whisper (speech-to-text)
    │                                    │
    ├────────────────────────────────────┘
    ↓
→ /api/extract
→ OpenAI GPT-4o (structured JSON extraction)
→ Supabase (persist meeting + action items, tagged by source)
→ Dashboard (filter, track, update status)
```

## 🔒 Governance & Security

- Row-Level Security (RLS) enabled on all Supabase tables from Day 0
- API keys stored server-side only — OpenAI key never reaches the browser
- Structured JSON output mode (`response_format: json_object`) ensures predictable parsing
- Server-side input validation on all API routes
- HTTPS enforced via Vercel

## 📡 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/transcribe` | Upload audio file → get Whisper transcription |
| POST | `/api/extract` | Send transcript → get AI-extracted action items |
| GET | `/api/meetings` | Fetch all meetings with nested action items |
| PATCH | `/api/action-items/[id]` | Update status, priority, owner, deadline, or task |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home — paste transcript or upload audio
│   ├── dashboard/page.tsx    # Dashboard — filterable action items + source badges
│   ├── layout.tsx            # Root layout with navigation
│   └── api/
│       ├── transcribe/route.ts  # Whisper audio transcription endpoint
│       ├── extract/route.ts     # GPT-4o action item extraction
│       ├── meetings/route.ts
│       └── action-items/[id]/route.ts
├── lib/
│   ├── openai.ts             # GPT-4o extraction logic
│   ├── whisper.ts            # Whisper transcription + file validation
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # TypeScript interfaces
└── components/ui/            # shadcn/ui components
```

## 🗄️ Database Schema

```sql
create table meetings (
  id uuid default gen_random_uuid() primary key,
  title text,
  raw_transcript text,
  summary text,
  source text check (source in ('paste', 'audio')),
  created_at timestamptz default now()
);

create table action_items (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references meetings(id) on delete cascade,
  task text not null,
  owner text,
  deadline text,
  priority text check (priority in ('high', 'medium', 'low')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 🚀 Production Roadmap

If transitioning this prototype to production scale:
1. **Authentication** — Add Supabase Auth with SSO/SAML for enterprise login
2. **Calendar integration** — Auto-ingest transcripts from Outlook/Google Calendar
3. **Notifications** — Slack/Teams alerts for assigned action items
4. **Audit logging** — Track all changes for compliance
5. **Role-based access** — Scoped RLS policies per team/department
6. **Speaker diarisation** — Identify individual speakers in audio recordings
7. **Real-time recording** — In-browser microphone capture with live transcription

## 📦 Run Locally

```bash
git clone https://github.com/ChristosLeptokaropoulos/AI-Meeting-Notes-Action-Items-Automator.git
cd AI-Meeting-Notes-Action-Items-Automator
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your keys:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   OPENAI_API_KEY=

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## ☁️ Deploy

Live at **[ai-meeting-notes-action-items-automator-8nooedz8m.vercel.app](https://ai-meeting-notes-action-items-automator-8nooedz8m.vercel.app)** — deployed on [Vercel](https://vercel.com/) with environment variables configured securely via the Vercel dashboard. All API keys are stored server-side — nothing is exposed to the browser.

## ⏱️ Build Time

**~8 hours** from zero to deployed prototype.

---

*Built by [Christos Leptokaropoulos](https://github.com/ChristosLeptokaropoulos) as part of a rapid prototyping portfolio demonstrating AI-enabled internal tool development.*
