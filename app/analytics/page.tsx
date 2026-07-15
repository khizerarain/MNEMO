import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { AnalyticsView, type AnalyticsData } from "@/components/app/AnalyticsView";
import { deriveTopic, calculateStreak } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [memoriesRes, connectionsRes, quizRes] = await Promise.all([
    supabase.from("memories").select("id, title, created_at").eq("user_id", user.id),
    supabase.from("connections").select("id, created_at").eq("user_id", user.id),
    supabase
      .from("quiz_cards")
      .select("id, repetitions, easiness_factor")
      .eq("user_id", user.id),
  ]);

  const memories = (memoriesRes.data || []) as { id: string; title: string; created_at: string }[];
  const connections = (connectionsRes.data || []) as { id: string; created_at: string }[];
  const cards = (quizRes.data || []) as { id: string; repetitions: number; easiness_factor: number }[];

  // heatmap
  const heatmap: Record<string, number> = {};
  for (const m of memories) {
    const k = new Date(m.created_at).toISOString().slice(0, 10);
    heatmap[k] = (heatmap[k] || 0) + 1;
  }
  for (const c of connections) {
    const k = new Date(c.created_at).toISOString().slice(0, 10);
    heatmap[k] = (heatmap[k] || 0) + 1;
  }

  // growth: last 8 months
  const growth: { label: string; value: number }[] = [];
  const nowD = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const value = memories.filter((m) => {
      const md = new Date(m.created_at);
      return md.getFullYear() === d.getFullYear() && md.getMonth() === d.getMonth();
    }).length;
    growth.push({ label, value });
  }

  // weekly: last 7 days
  const weekly: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const label = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const value =
      memories.filter((m) => new Date(m.created_at).toDateString() === key).length +
      connections.filter((c) => new Date(c.created_at).toDateString() === key).length;
    weekly.push({ label, value });
  }

  // topics by memory count
  const topicCounts = new Map<string, number>();
  for (const m of memories) {
    const t = deriveTopic(m.title);
    topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
  }
  const topics = Array.from(topicCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const avgEf =
    cards.length > 0
      ? cards.reduce((s, c) => s + (c.easiness_factor || 2.5), 0) / cards.length
      : 0;
  const retentionPct =
    cards.length > 0
      ? Math.max(35, Math.min(99, Math.round(35 + ((avgEf - 1.3) / (2.7 - 1.3)) * 64)))
      : 0;
  const reviewedCards = cards.filter((c) => c.repetitions > 0).length;

  const data: AnalyticsData = {
    streak: calculateStreak([
      ...memories.map((m) => m.created_at),
      ...connections.map((c) => c.created_at),
    ]),
    retentionPct,
    reviewCoverage:
      cards.length > 0 ? Math.round((reviewedCards / cards.length) * 100) : 0,
    totalMemories: memories.length,
    totalConnections: connections.length,
    totalCards: cards.length,
    masteredCards: cards.filter((c) => c.repetitions >= 3).length,
    avgConnections:
      memories.length > 0
        ? Math.round((connections.length * 2 / memories.length) * 10) / 10
        : 0,
    growth,
    weekly,
    topics,
    heatmap,
  };

  return (
    <AppShell userEmail={user.email}>
      <AnalyticsView data={data} />
    </AppShell>
  );
}
