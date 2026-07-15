# MNEMO

MNEMO is an AI-powered second brain that lets you save anything you've read or learned, automatically connects ideas across everything you've saved, visualizes your knowledge as an interactive graph, and quizzes you using spaced repetition so you never forget.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Database + Auth:** Supabase (Postgres + Auth + pgvector extension)
- **AI:** Anthropic API (Claude Sonnet 4.6)
- **Embeddings:** Voyage AI (`voyage-3` model)
- **Knowledge Graph:** `react-force-graph-2d`
- **Spaced Repetition:** SM-2 algorithm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

> **Note:** If you are using a separate Voyage AI API key, set `VOYAGE_API_KEY`. Otherwise, the app will fall back to `ANTHROPIC_API_KEY`.

### 3. Set up Supabase

1. Create a new Supabase project.
2. Enable the `vector` extension in the database (SQL Editor → New query → `create extension if not exists vector;`).
3. Run the full schema from `schema.sql` in the Supabase SQL Editor.
4. Copy your project URL and anon key into `.env.local`.
5. Copy the service role key into `.env.local` (used for admin tasks only).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Capture:** Paste any content and MNEMO extracts 5-8 core ideas, generates quiz questions, and saves an embedding for semantic search.
- **Connections:** Automatically finds related memories using pgvector and explains the connection with Claude.
- **Knowledge Graph:** Interactive 2D force-directed graph of all your memories and connections.
- **Quiz Mode:** Daily spaced-repetition review using the SM-2 algorithm.
- **Ask Your Brain:** RAG chat that answers questions only from your saved knowledge.

## Project Structure

```
/app
  /auth              # Login + signup pages
  /dashboard         # Main dashboard with stats and recent memories
  /capture           # Add new memory
  /graph             # Knowledge graph visualization
  /quiz              # Daily quiz
  /chat              # RAG chat
  /api               # API routes (capture, quiz, chat)
/components
  /ui                # shadcn/ui components
  Navbar.tsx
  MemoryCard.tsx
  ConnectionCard.tsx
  KnowledgeGraph.tsx
  QuizCard.tsx
  ChatInterface.tsx
/lib
  supabase.ts        # Browser Supabase client
  supabase-server.ts # Server Supabase client
  anthropic.ts       # Anthropic client
  prompts.ts         # AI prompts
  embeddings.ts      # Embedding generation + similarity search
  sm2.ts             # Spaced repetition algorithm
  connections.ts     # Connection finding logic
schema.sql           # Supabase database schema
```

## Deploy to Vercel

1. Push your code to a GitHub repository.
2. Import the project in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` in the Vercel dashboard (Project Settings → Environment Variables).
4. Deploy.

Vercel will automatically build and deploy the Next.js app.

## Notes

- The embedding vector dimension is 1024 (`voyage-3`). Make sure the `memories.embedding` column and the `match_memories` function use the same dimension.
- All database queries use Row Level Security (RLS) and are scoped to the authenticated user.
- The app uses the `@supabase/ssr` package for secure server-side and client-side auth.
