import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { MemoriesView, type MemoryItem } from "@/components/app/MemoriesView";
import { deriveTopic } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

type Idea = { insight: string; question: string; answer: string };

export default async function MemoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [memoriesRes, connectionsRes] = await Promise.all([
    supabase
      .from("memories")
      .select("id, title, raw_content, source_url, ideas, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("connections")
      .select("id, memory_a_id, memory_b_id, explanation, similarity_score")
      .eq("user_id", user.id),
  ]);

  const memories = (memoriesRes.data || []) as {
    id: string;
    title: string;
    raw_content: string;
    source_url: string | null;
    ideas: Idea[];
    created_at: string;
  }[];
  const connections = (connectionsRes.data || []) as {
    id: string;
    memory_a_id: string;
    memory_b_id: string;
    explanation: string;
    similarity_score: number;
  }[];

  const titleById = new Map(memories.map((m) => [m.id, m.title]));

  const items: MemoryItem[] = memories.map((m) => {
    const rel = connections
      .filter((c) => c.memory_a_id === m.id || c.memory_b_id === m.id)
      .map((c) => {
        const otherId = c.memory_a_id === m.id ? c.memory_b_id : c.memory_a_id;
        return {
          id: otherId,
          title: titleById.get(otherId) || "Untitled",
          explanation: c.explanation,
          score: c.similarity_score,
        };
      });
    const ideas = Array.isArray(m.ideas) ? m.ideas : [];
    return {
      id: m.id,
      title: m.title,
      topic: deriveTopic(m.title),
      created_at: m.created_at,
      snippet: (m.raw_content || ideas[0]?.insight || "").slice(0, 200),
      ideas,
      source_url: m.source_url,
      connectionCount: rel.length,
      importance: ideas.length + rel.length * 2,
      connections: rel,
    };
  });

  return (
    <AppShell userEmail={user.email}>
      <Suspense fallback={null}>
        <MemoriesView memories={items} />
      </Suspense>
    </AppShell>
  );
}
