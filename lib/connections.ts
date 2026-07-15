import { createClient } from "./supabase-server";
import { callLLM } from "./openrouter";
import { findSimilarMemories } from "./embeddings";
import { CONNECTION_PROMPT } from "./prompts";

export async function findConnections(
  memoryId: string,
  userId: string,
  embedding: number[]
) {
  const supabase = await createClient();

  const { data: newMemory, error: memoryError } = await supabase
    .from("memories")
    .select("raw_content")
    .eq("id", memoryId)
    .eq("user_id", userId)
    .single();

  if (memoryError || !newMemory) {
    console.error("Failed to load new memory for connection finding:", memoryError);
    return;
  }

  const similarMemories = await findSimilarMemories(embedding, userId, 0.75, 5);
  const others = similarMemories.filter((m) => m.id !== memoryId);

  if (others.length === 0) return;

  for (const other of others) {
    try {
      const connectionPrompt = CONNECTION_PROMPT(
        newMemory.raw_content,
        other.raw_content
      );

      const explanation = await callLLM(
        [{ role: "user", content: connectionPrompt }],
        200
      );

      if (!explanation.trim()) continue;

      const { error: insertError } = await supabase.from("connections").insert({
        user_id: userId,
        memory_a_id: memoryId,
        memory_b_id: other.id,
        explanation,
        similarity_score: other.similarity,
      });

      if (insertError) {
        console.error("Failed to save connection:", insertError);
      }
    } catch (err) {
      console.error("Error finding connection:", err);
    }
  }
}
