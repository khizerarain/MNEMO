-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  raw_content text NOT NULL,
  source_url text,
  title text,
  ideas jsonb NOT NULL DEFAULT '[]'::jsonb,
  embedding vector(1024),
  created_at timestamp with time zone DEFAULT now()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_a_id uuid REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  memory_b_id uuid REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  explanation text NOT NULL,
  similarity_score float NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT different_memories CHECK (memory_a_id <> memory_b_id)
);

-- Quiz cards table
CREATE TABLE IF NOT EXISTS quiz_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_id uuid REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  repetitions int DEFAULT 0,
  easiness_factor float DEFAULT 2.5,
  interval_days int DEFAULT 1,
  next_review_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access their own memories" ON memories;
CREATE POLICY "Users can only access their own memories"
  ON memories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own connections" ON connections;
CREATE POLICY "Users can only access their own connections"
  ON connections FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only access their own quiz cards" ON quiz_cards;
CREATE POLICY "Users can only access their own quiz cards"
  ON quiz_cards FOR ALL USING (auth.uid() = user_id);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  ideas jsonb,
  raw_content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    ideas,
    raw_content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM memories
  WHERE user_id = p_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
