import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AppShell } from "@/components/app/AppShell";
import { InsightsView, type Insight } from "@/components/app/InsightsView";
import { deriveTopic, calculateStreak, relativeTime } from "@/lib/knowledge";

export const dynamic = "force-dynamic";

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour} ${period}`;
}

export default async function InsightsPage() {
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
      .select("id, memory_id, repetitions, easiness_factor, next_review_at")
      .eq("user_id", user.id),
  ]);

  const memories = (memoriesRes.data || []) as { id: string; title: string; created_at: string }[];
  const connections = (connectionsRes.data || []) as { id: string; created_at: string }[];
  const cards = (quizRes.data || []) as {
    id: string;
    memory_id: string;
    repetitions: number;
    easiness_factor: number;
    next_review_at: string;
  }[];

  const memoryById = new Map(memories.map((m) => [m.id, m]));
  const insights: Insight[] = [];

  // 1. Peak learning hour
  if (memories.length >= 4) {
    const hours = new Array(24).fill(0);
    for (const m of memories) hours[new Date(m.created_at).getHours()]++;
    const peak = hours.indexOf(Math.max(...hours));
    insights.push({
      id: "peak",
      icon: "clock",
      accent: "#06b6d4",
      title: "Your peak learning window",
      body: `You capture the most knowledge around ${formatHour(peak)}. Schedule deep-focus learning then to make ideas stick.`,
      metric: formatHour(peak),
    });
  }

  // topic EF stats
  const topicStats = new Map<string, { sum: number; n: number }>();
  for (const c of cards) {
    const mem = memoryById.get(c.memory_id);
    if (!mem) continue;
    const t = deriveTopic(mem.title);
    const cur = topicStats.get(t) || { sum: 0, n: 0 };
    cur.sum += c.easiness_factor || 2.5;
    cur.n += 1;
    topicStats.set(t, cur);
  }
  const ranked = Array.from(topicStats.entries())
    .map(([topic, s]) => ({ topic, avg: s.sum / s.n }))
    .sort((a, b) => b.avg - a.avg);
  const efToPct = (ef: number) =>
    Math.max(40, Math.min(98, Math.round(40 + ((ef - 1.3) / (2.7 - 1.3)) * 58)));

  // 2. Strongest topic
  if (ranked.length >= 1) {
    const top = ranked[0];
    insights.push({
      id: "strong",
      icon: "trophy",
      accent: "#22c55e",
      title: `You're mastering ${top.topic}`,
      body: `Your recall on ${top.topic} concepts is excellent. These memories are well-consolidated in your long-term memory.`,
      metric: `${efToPct(top.avg)}%`,
    });
  }

  // 3. Weakest topic
  if (ranked.length >= 2) {
    const low = ranked[ranked.length - 1];
    insights.push({
      id: "weak",
      icon: "alert",
      accent: "#f59e0b",
      title: `${low.topic} needs attention`,
      body: `You struggle more with ${low.topic}. A short focused review session would strengthen these connections.`,
      metric: `${efToPct(low.avg)}%`,
    });
  }

  // 4. Overdue reviews
  const now = Date.now();
  const overdue = cards.filter((c) => new Date(c.next_review_at).getTime() < now - 7 * 86400000);
  if (overdue.length > 0) {
    insights.push({
      id: "overdue",
      icon: "calendar",
      accent: "#ec4899",
      title: "Some memories are fading",
      body: `You have ${overdue.length} card${overdue.length === 1 ? "" : "s"} you haven't reviewed in over a week. Review them soon before they slip away.`,
      metric: `${overdue.length}`,
    });
  }

  // 5. Streak / consistency
  const streak = calculateStreak([
    ...memories.map((m) => m.created_at),
    ...connections.map((c) => c.created_at),
  ]);
  if (streak >= 1) {
    insights.push({
      id: "streak",
      icon: "flame",
      accent: "#f59e0b",
      title: streak >= 3 ? "You're on a roll" : "Building momentum",
      body: `You've been active ${streak} day${streak === 1 ? "" : "s"} in a row. Consistency is the single biggest driver of long-term retention.`,
      metric: `${streak}d`,
    });
  }

  // 6. Connection density
  if (memories.length >= 3) {
    const density = memories.length > 0 ? (connections.length * 2) / memories.length : 0;
    insights.push({
      id: "density",
      icon: "link",
      accent: "#7c3aed",
      title:
        density >= 1.5
          ? "Your ideas are richly connected"
          : "Room to connect more ideas",
      body:
        density >= 1.5
          ? `On average each memory links to ${density.toFixed(1)} others. Dense knowledge graphs make recall dramatically easier.`
          : `Your memories are fairly isolated (${density.toFixed(1)} links each). Capturing related ideas will help Mnemo connect them.`,
      metric: density.toFixed(1),
    });
  }

  // 7. Growth trend
  if (memories.length >= 2) {
    const week = 7 * 86400000;
    const thisWeek = memories.filter((m) => now - new Date(m.created_at).getTime() < week).length;
    const lastWeek = memories.filter((m) => {
      const age = now - new Date(m.created_at).getTime();
      return age >= week && age < 2 * week;
    }).length;
    if (thisWeek > 0 || lastWeek > 0) {
      const up = thisWeek >= lastWeek;
      insights.push({
        id: "growth",
        icon: "trend",
        accent: "#06b6d4",
        title: up ? "Your brain is growing faster" : "Capture pace has slowed",
        body: `You added ${thisWeek} memor${thisWeek === 1 ? "y" : "ies"} this week vs ${lastWeek} last week. ${
          up ? "Keep the momentum going." : "A quick capture session would get you back on track."
        }`,
        metric: `${thisWeek}`,
      });
    }
  }

  // oldest untouched memory as a gentle nudge
  if (memories.length >= 5) {
    const oldest = [...memories].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )[0];
    insights.push({
      id: "revisit",
      icon: "bulb",
      accent: "#8b5cf6",
      title: "Revisit an old idea",
      body: `“${oldest.title}” was captured ${relativeTime(oldest.created_at)}. Revisiting older memories reinforces them and often sparks new connections.`,
    });
  }

  const summary = (() => {
    if (memories.length === 0)
      return "Start capturing memories and Mnemo will analyze your learning patterns, strengths, and gaps.";
    const strong = ranked[0]?.topic;
    const parts: string[] = [];
    parts.push(
      `You've built ${memories.length} memor${memories.length === 1 ? "y" : "ies"} with ${connections.length} connection${connections.length === 1 ? "" : "s"}.`
    );
    if (strong) parts.push(`Your strongest area is ${strong}.`);
    if (streak >= 2) parts.push(`You're on a ${streak}-day streak — consistency is paying off.`);
    else parts.push(`Capture something today to build your streak.`);
    return parts.join(" ");
  })();

  return (
    <AppShell userEmail={user.email}>
      <InsightsView insights={insights} summary={summary} />
    </AppShell>
  );
}
