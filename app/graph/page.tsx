import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { GraphExplorer, type GraphNode, type GraphLink } from "@/components/app/GraphExplorer";
import { deriveTopic, colorForKey } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

type Idea = { insight: string; question: string; answer: string };

export default async function GraphPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [memoriesRes, connectionsRes, quizRes] = await Promise.all([
    supabase.from("memories").select("id, title, ideas").eq("user_id", user.id),
    supabase
      .from("connections")
      .select("memory_a_id, memory_b_id, similarity_score, explanation")
      .eq("user_id", user.id),
    supabase
      .from("quiz_cards")
      .select("memory_id, easiness_factor")
      .eq("user_id", user.id),
  ]);

  const memories = (memoriesRes.data || []) as { id: string; title: string; ideas: Idea[] }[];
  const connections = (connectionsRes.data || []) as {
    memory_a_id: string;
    memory_b_id: string;
    similarity_score: number;
    explanation: string;
  }[];
  const cards = (quizRes.data || []) as { memory_id: string; easiness_factor: number }[];

  const titleById = new Map(memories.map((m) => [m.id, m.title]));

  const connCount = new Map<string, number>();
  for (const c of connections) {
    connCount.set(c.memory_a_id, (connCount.get(c.memory_a_id) || 0) + 1);
    connCount.set(c.memory_b_id, (connCount.get(c.memory_b_id) || 0) + 1);
  }

  const cardStats = new Map<string, { sum: number; n: number }>();
  for (const c of cards) {
    const cur = cardStats.get(c.memory_id) || { sum: 0, n: 0 };
    cur.sum += c.easiness_factor || 2.5;
    cur.n += 1;
    cardStats.set(c.memory_id, cur);
  }
  const efToPct = (ef: number) =>
    Math.max(40, Math.min(98, Math.round(40 + ((ef - 1.3) / (2.7 - 1.3)) * 58)));

  const relatedByMemory = new Map<
    string,
    { id: string; title: string; explanation: string; score: number }[]
  >();
  for (const c of connections) {
    const push = (from: string, to: string) => {
      const arr = relatedByMemory.get(from) || [];
      arr.push({
        id: to,
        title: titleById.get(to) || "Untitled",
        explanation: c.explanation,
        score: c.similarity_score,
      });
      relatedByMemory.set(from, arr);
    };
    push(c.memory_a_id, c.memory_b_id);
    push(c.memory_b_id, c.memory_a_id);
  }

  const nodes: GraphNode[] = memories.map((m) => {
    const topic = deriveTopic(m.title);
    const stat = cardStats.get(m.id);
    const cc = connCount.get(m.id) || 0;
    return {
      id: m.id,
      title: m.title,
      topic,
      color: colorForKey(topic),
      val: 4 + Math.min(cc, 8),
      ideas: Array.isArray(m.ideas) ? m.ideas.map((i) => i.insight) : [],
      connectionCount: cc,
      retentionPct: stat ? efToPct(stat.sum / stat.n) : null,
      cardCount: stat?.n || 0,
      related: relatedByMemory.get(m.id) || [],
    };
  });

  const links: GraphLink[] = connections.map((c) => ({
    source: c.memory_a_id,
    target: c.memory_b_id,
    similarity: c.similarity_score,
  }));

  return (
    <AppShell userEmail={user.email}>
      <GraphExplorer nodes={nodes} links={links} />
    </AppShell>
  );
}
