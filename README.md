# AI Meeting Notes & Action Items Automator

A web app where you paste or upload a meeting transcript. AI extracts structured action items (task, owner, deadline, priority) and displays them in a filterable dashboard. All data persists in Supabase.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)
- **Database**: [Supabase](https://supabase.com)
- **AI**: [OpenAI](https://openai.com)

## Getting Started

### Prerequisites

Create a `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/               # Next.js App Router pages and layouts
├── components/
│   └── ui/            # shadcn/ui components (button, card, dialog, etc.)
├── hooks/             # Custom React hooks (use-toast)
└── lib/               # Utility functions (cn helper)
```

## Deploy on Vercel

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
