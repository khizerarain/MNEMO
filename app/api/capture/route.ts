import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { callLLM, stripMarkdownJson } from "@/lib/openrouter";
import { generateEmbedding } from "@/lib/embeddings";
import { findConnections } from "@/lib/connections";
import { EXTRACTION_PROMPT } from "@/lib/prompts";

export const dynamic = "force-dynamic";

interface ExtractedIdea {
  insight: string;
  question: string;
  answer: string;
}

interface ExtractedContent {
  title: string;
  ideas: ExtractedIdea[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, sourceUrl } = body as { content: string; sourceUrl?: string };

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    const rawText = await callLLM(
      [{ role: "user", content: EXTRACTION_PROMPT(trimmedContent) }],
      1000,
      "json_object"
    );

    const cleanedText = stripMarkdownJson(rawText);

    let extracted: ExtractedContent;
    try {
      extracted = JSON.parse(cleanedText) as ExtractedContent;
    } catch (parseError) {
      console.error("Failed to parse AI extraction response:", rawText, parseError);
      return NextResponse.json(
        { error: "Failed to parse AI extraction response" },
        { status: 500 }
      );
    }

    if (!extracted.title || !Array.isArray(extracted.ideas)) {
      return NextResponse.json(
        { error: "Invalid extraction response structure" },
        { status: 500 }
      );
    }

    // Generate the embedding, but do not let a Voyage rate-limit (or any other
    // embedding failure) block saving the memory. We still want the user to keep
    // their notes and quiz cards even if the vector search is temporarily unavailable.
    let embedding: number[] | null = null;
    let embeddingWarning: string | null = null;
    try {
      embedding = await generateEmbedding(trimmedContent);
    } catch (embeddingError) {
      console.error("Embedding failed, saving memory without vector:", embeddingError);
      embeddingWarning = "We saved your memory, but the AI connection feature is temporarily unavailable because the embedding service is rate-limited.";
    }

    const { data: memory, error: insertError } = await supabase
      .from("memories")
      .insert({
        user_id: user.id,
        raw_content: trimmedContent,
        source_url: sourceUrl || null,
        title: extracted.title,
        ideas: extracted.ideas,
        embedding: embedding ? JSON.stringify(embedding) : null,
      })
      .select()
      .single();

    if (insertError || !memory) {
      console.error("Failed to insert memory:", insertError);
      return NextResponse.json(
        { error: "Failed to save memory" },
        { status: 500 }
      );
    }

    const quizCards = extracted.ideas.map((idea) => ({
      user_id: user.id,
      memory_id: memory.id,
      question: idea.question,
      answer: idea.answer,
    }));

    if (quizCards.length > 0) {
      const { error: quizError } = await supabase.from("quiz_cards").insert(quizCards);
      if (quizError) {
        console.error("Failed to insert quiz cards:", quizError);
      }
    }

    // Only search for semantic connections if the embedding was generated successfully.
    if (embedding) {
      void findConnections(memory.id, user.id, embedding);
    }

    return NextResponse.json({ success: true, memory, warning: embeddingWarning });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
