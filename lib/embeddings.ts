import { createClient as createServerClient } from "./supabase-server";

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const EMBEDDING_MODEL = "voyage-3";
const EMBEDDING_DIMENSION = 1024;

function getVoyageApiKey(): string {
  const key = process.env.VOYAGE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Missing VOYAGE_API_KEY or ANTHROPIC_API_KEY environment variable");
  }
  return key;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getVoyageApiKey()}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      input_type: "document",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const embedding: number[] = data.data?.[0]?.embedding;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Invalid embedding response. Expected ${EMBEDDING_DIMENSION} dimensions, got ${embedding?.length}.`
    );
  }

  return embedding;
}

export async function findSimilarMemories(
  embedding: number[],
  userId: string,
  threshold: number = 0.75,
  matchCount: number = 5
): Promise<MatchedMemory[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("match_memories", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: matchCount,
    p_user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to find similar memories: ${error.message}`);
  }

  return (data || []) as MatchedMemory[];
}

export interface MatchedMemory {
  id: string;
  title: string;
  ideas: Array<{ insight: string; question: string; answer: string }>;
  raw_content: string;
  similarity: number;
}
