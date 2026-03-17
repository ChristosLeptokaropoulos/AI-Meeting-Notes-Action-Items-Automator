# AI Meeting Action Extractor

A full-stack web app that uses AI to extract structured action items from meeting transcripts. Paste a transcript, get tasks with owners, deadlines, and priorities — then track everything in a persistent dashboard.

## Features

- **AI-Powered Extraction** — GPT-4o parses meeting transcripts and returns structured action items (task, owner, deadline, priority)
- **Persistent Dashboard** — View all action items across all meetings with status and priority filters
- **Inline Status Updates** — Change task status (Pending → In Progress → Completed) directly from the dashboard
- **Sample Transcript** — One-click demo with a realistic meeting transcript
- **Real-Time Stats** — At-a-glance counts for total, pending, in-progress, completed, and high-priority items

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| AI | OpenAI GPT-4o |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project with `meetings` and `action_items` tables
- An [OpenAI](https://platform.openai.com/) API key

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your keys:
#   NEXT_PUBLIC_SUPABASE_URL=
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=
#   OPENAI_API_KEY=

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Database Schema

```sql
create table meetings (
  id uuid default gen_random_uuid() primary key,
  title text,
  raw_transcript text,
  summary text,
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

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/extract` | Send transcript → get AI-extracted action items |
| GET | `/api/meetings` | Fetch all meetings with nested action items |
| PATCH | `/api/action-items/[id]` | Update status, priority, owner, deadline, or task |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home — transcript input + extraction
│   ├── dashboard/page.tsx    # Dashboard — filterable action items view
│   ├── layout.tsx            # Root layout with navigation
│   └── api/
│       ├── extract/route.ts
│       ├── meetings/route.ts
│       └── action-items/[id]/route.ts
├── lib/
│   ├── openai.ts             # GPT-4o extraction logic
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # TypeScript interfaces
└── components/ui/            # shadcn/ui components
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ChristosLeptokaropoulos/AI-Meeting-Notes-Action-Items-Automator)

Set environment variables in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
