import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { callLLM } from "@/lib/openrouter";
import { generateEmbedding, findSimilarMemories } from "@/lib/embeddings";
import { RAG_SYSTEM_PROMPT } from "@/lib/prompts";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
    const { message, history } = body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    const questionEmbedding = await generateEmbedding(trimmedMessage);
    const relevantMemories = await findSimilarMemories(
      questionEmbedding,
      user.id,
      0.6,
      5
    );

    const context = relevantMemories
      .map(
        (m) =>
          `[${m.title}]: ${m.ideas.map((i) => i.insight).join(". ")}`
      )
      .join("\n\n");

    const systemPrompt = RAG_SYSTEM_PROMPT(context);

    const reply = await callLLM(
      [
        { role: "system", content: systemPrompt },
        ...(history || []),
        { role: "user", content: trimmedMessage },
      ],
      1000
    );

    const sources = relevantMemories.map((m) => ({
      id: m.id,
      title: m.title,
    }));

    return NextResponse.json({ reply, sources });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
