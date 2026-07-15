import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { DashboardView, type DashboardData } from "@/components/app/DashboardView";
import { deriveTopic, calculateStreak } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

type Idea = { insight: string; question: string; answer: string };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [memoriesRes, connectionsRes, quizRes] = await Promise.all([
    supabase
      .from("memories")
      .select("id, title, ideas, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("connections")
      .select("id, memory_a_id, memory_b_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("quiz_cards")
      .select("id, memory_id, repetitions, easiness_factor, next_review_at")
      .eq("user_id", user.id),
  ]);

  const memories = (memoriesRes.data || []) as {
    id: string;
    title: string;
    ideas: Idea[];
    created_at: string;
  }[];
  const connections = (connectionsRes.data || []) as {
    id: string;
    memory_a_id: string;
    memory_b_id: string;
    created_at: string;
  }[];
  const quizCards = (quizRes.data || []) as {
    id: string;
    memory_id: string;
    repetitions: number;
    easiness_factor: number;
    next_review_at: string;
  }[];

  const isToday = (iso: string) =>
    new Date(iso).toDateString() === new Date().toDateString();
  const now = Date.now();

  const memoryById = new Map(memories.map((m) => [m.id, m]));
  const titleById = (id: string) => memoryById.get(id)?.title || "a memory";

  // connection counts per memory
  const connCount = new Map<string, number>();
  for (const c of connections) {
    connCount.set(c.memory_a_id, (connCount.get(c.memory_a_id) || 0) + 1);
    connCount.set(c.memory_b_id, (connCount.get(c.memory_b_id) || 0) + 1);
  }

  // heatmap
  const heatmap: Record<string, number> = {};
  for (const m of memories) {
    const key = new Date(m.created_at).toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] || 0) + 1;
  }
  for (const c of connections) {
    const key = new Date(c.created_at).toISOString().slice(0, 10);
    heatmap[key] = (heatmap[key] || 0) + 1;
  }

  // recent topics
  const recentTopics = Array.from(
    new Set(memories.slice(0, 6).map((m) => deriveTopic(m.title)))
  ).slice(0, 4);

  // suggestion: two recent memories, different topics, not already connected
  const connectedPairs = new Set(
    connections.flatMap((c) => [
      `${c.memory_a_id}:${c.memory_b_id}`,
      `${c.memory_b_id}:${c.memory_a_id}`,
    ])
  );
  let suggestion: { a: string; b: string } | null = null;
  const recent = memories.slice(0, 8);
  outer: for (let i = 0; i < recent.length; i++) {
    for (let j = i + 1; j < recent.length; j++) {
      const a = recent[i];
      const b = recent[j];
      const topicA = deriveTopic(a.title);
      const topicB = deriveTopic(b.title);
      if (topicA !== topicB && !connectedPairs.has(`${a.id}:${b.id}`)) {
        suggestion = { a: topicA, b: topicB };
        break outer;
      }
    }
  }

  // activity feed
  const feed = [
    ...memories.slice(0, 8).map((m) => ({
      type: "memory" as const,
      title: `Added “${m.title}”`,
      time: m.created_at,
      id: m.id,
    })),
    ...connections.slice(0, 8).map((c) => ({
      type: "connection" as const,
      title: `Connected “${titleById(c.memory_a_id)}” ↔ “${titleById(c.memory_b_id)}”`,
      time: c.created_at,
      id: c.id,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  // insights from quiz easiness factor grouped by topic
  const topicStats = new Map<string, { sumEf: number; n: number }>();
  for (const card of quizCards) {
    const mem = memoryById.get(card.memory_id);
    if (!mem) continue;
    const topic = deriveTopic(mem.title);
    const cur = topicStats.get(topic) || { sumEf: 0, n: 0 };
    cur.sumEf += card.easiness_factor || 2.5;
    cur.n += 1;
    topicStats.set(topic, cur);
  }
  const efToPct = (ef: number) =>
    Math.max(35, Math.min(99, Math.round(35 + ((ef - 1.3) / (2.7 - 1.3)) * 64)));

  let strongest: string | null = null;
  let weakest: string | null = null;
  let strongestPct = 0;
  let weakestPct = 0;
  const ranked = Array.from(topicStats.entries())
    .map(([topic, s]) => ({ topic, avg: s.sumEf / s.n }))
    .sort((a, b) => b.avg - a.avg);
  if (ranked.length > 0) {
    strongest = ranked[0].topic;
    strongestPct = efToPct(ranked[0].avg);
    weakest = ranked[ranked.length - 1].topic;
    weakestPct = efToPct(ranked[ranked.length - 1].avg);
    if (ranked.length === 1) weakest = null;
  }

  const data: DashboardData = {
    stats: {
      memoriesToday: memories.filter((m) => isToday(m.created_at)).length,
      connectionsToday: connections.filter((c) => isToday(c.created_at)).length,
      dueCards: quizCards.filter((c) => new Date(c.next_review_at).getTime() <= now)
        .length,
      totalMemories: memories.length,
      totalConnections: connections.length,
      streak: calculateStreak([
        ...memories.map((m) => m.created_at),
        ...connections.map((c) => c.created_at),
      ]),
    },
    recentTopics,
    suggestion,
    heatmap,
    feed,
    insights: { strongest, weakest, strongestPct, weakestPct },
    recentMemories: memories.slice(0, 5).map((m) => ({
      id: m.id,
      title: m.title,
      topic: deriveTopic(m.title),
      created_at: m.created_at,
      ideasCount: Array.isArray(m.ideas) ? m.ideas.length : 0,
      connectionCount: connCount.get(m.id) || 0,
    })),
    firstName: (user.email?.split("@")[0] || "").replace(/[^a-zA-Z]/g, "").slice(0, 16),
  };

  return (
    <AppShell userEmail={user.email}>
      <DashboardView data={data} />
    </AppShell>
  );
}
