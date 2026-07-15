"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Link2,
  GraduationCap,
  Flame,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Network,
  FileText,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Reveal, AnimatedCounter } from "@/components/landing/primitives";
import { GlowCard, ContributionHeatmap } from "@/components/app/widgets";
import { PageHeader } from "@/components/app/AppShell";
import { relativeTime, clockTime, colorForKey } from "@/lib/knowledge";

export type DashboardData = {
  stats: {
    memoriesToday: number;
    connectionsToday: number;
    dueCards: number;
    totalMemories: number;
    totalConnections: number;
    streak: number;
  };
  recentTopics: string[];
  suggestion: { a: string; b: string } | null;
  heatmap: Record<string, number>;
  feed: { type: "memory" | "connection"; title: string; time: string; id: string }[];
  insights: {
    strongest: string | null;
    weakest: string | null;
    strongestPct: number;
    weakestPct: number;
  };
  recentMemories: {
    id: string;
    title: string;
    topic: string;
    created_at: string;
    ideasCount: number;
    connectionCount: number;
  }[];
  firstName: string;
};

export function DashboardView({ data }: { data: DashboardData }) {
  const { stats, recentTopics, suggestion, heatmap, feed, insights, recentMemories } = data;

  const today = [
    { label: "Memories created", value: stats.memoriesToday, icon: BookOpen, glow: "124, 58, 237" },
    { label: "Connections found", value: stats.connectionsToday, icon: Link2, glow: "6, 182, 212" },
    { label: "Quiz cards due", value: stats.dueCards, icon: GraduationCap, glow: "34, 197, 94" },
  ];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        title={`${greeting}${data.firstName ? `, ${data.firstName}` : ""}`}
        description="Here's what's happening in your second brain today."
        actions={
          <>
            <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm sm:flex">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-semibold text-white">{stats.streak}</span>
              <span className="text-mnemo-muted">day streak</span>
            </div>
            <Link
              href="/capture"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]"
            >
              <Plus className="h-4 w-4" /> New Memory
            </Link>
          </>
        }
      />

      {/* Today's activity */}
      <div className="grid gap-4 sm:grid-cols-3">
        {today.map((t, i) => (
          <Reveal key={t.label} delay={i * 0.06}>
            <GlowCard glow={t.glow} className="p-5">
              <div className="flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `rgba(${t.glow},0.12)`, color: `rgb(${t.glow})` }}
                >
                  <t.icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-mnemo-muted">
                  Today
                </span>
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">
                <AnimatedCounter value={t.value} />
              </div>
              <p className="mt-1 text-sm text-mnemo-muted">{t.label}</p>
            </GlowCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          {/* AI suggestion */}
          <Reveal>
            <GlowCard className="overflow-hidden p-6" glow="124, 58, 237">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-mnemo-primary/20 blur-3xl" />
              <div className="relative flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mnemo-primary" />
                <span className="text-sm font-semibold text-white">AI Suggestions</span>
              </div>
              {recentTopics.length > 0 ? (
                <div className="relative mt-4">
                  <p className="text-sm text-mnemo-muted">You recently explored</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recentTopics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border px-3 py-1 text-xs font-medium"
                        style={{
                          color: colorForKey(t),
                          borderColor: `${colorForKey(t)}40`,
                          backgroundColor: `${colorForKey(t)}12`,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {suggestion && (
                    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-mnemo-muted">Suggested connection</p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-white">
                          {suggestion.a}
                          <ArrowRight className="h-3.5 w-3.5 text-mnemo-accent" />
                          {suggestion.b}
                        </p>
                      </div>
                      <Link
                        href="/graph"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:border-white/25"
                      >
                        Explore <Network className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="relative mt-4 text-sm text-mnemo-muted">
                  Capture a few memories and Mnemo will start suggesting connections between your ideas.
                </p>
              )}
            </GlowCard>
          </Reveal>

          {/* Heatmap */}
          <Reveal delay={0.05}>
            <GlowCard className="p-6" hover={false}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Memory heatmap</h3>
                  <p className="text-xs text-mnemo-muted">Your capture activity over time</p>
                </div>
                <span className="text-xs text-mnemo-muted">
                  {Object.values(heatmap).reduce((a, b) => a + b, 0)} events
                </span>
              </div>
              <ContributionHeatmap counts={heatmap} />
              <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-mnemo-muted">
                Less
                {[0.04, 0.25, 0.45, 0.7, 1].map((o) => (
                  <span
                    key={o}
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: `rgba(124,58,237,${o})` }}
                  />
                ))}
                More
              </div>
            </GlowCard>
          </Reveal>

          {/* Recent memories */}
          <Reveal delay={0.1}>
            <GlowCard className="p-6" hover={false}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Recent memories</h3>
                <Link href="/memories" className="text-xs text-mnemo-muted hover:text-white">
                  View all
                </Link>
              </div>
              {recentMemories.length === 0 ? (
                <EmptyMini />
              ) : (
                <div className="space-y-2">
                  {recentMemories.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/memories?open=${m.id}`}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${colorForKey(m.topic)}1f`, color: colorForKey(m.topic) }}
                        >
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{m.title}</p>
                          <p className="text-xs text-mnemo-muted">
                            {m.topic} · {m.ideasCount} ideas · {relativeTime(m.created_at)}
                          </p>
                        </div>
                        {m.connectionCount > 0 && (
                          <span className="hidden items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] text-mnemo-muted sm:flex">
                            <Link2 className="h-3 w-3" />
                            {m.connectionCount}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlowCard>
          </Reveal>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Knowledge insights */}
          <Reveal delay={0.05}>
            <GlowCard className="p-6" glow="34, 197, 94">
              <h3 className="text-sm font-semibold text-white">Knowledge insights</h3>
              <div className="mt-4 space-y-3">
                <InsightRow
                  icon={TrendingUp}
                  color="#22c55e"
                  label="Strongest topic"
                  value={insights.strongest}
                  pct={insights.strongestPct}
                />
                <InsightRow
                  icon={TrendingDown}
                  color="#f59e0b"
                  label="Needs review"
                  value={insights.weakest}
                  pct={insights.weakestPct}
                />
              </div>
              <Link
                href="/insights"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-xs font-medium text-white transition-colors hover:border-white/25"
              >
                <Sparkles className="h-3.5 w-3.5 text-mnemo-primary" /> See all insights
              </Link>
            </GlowCard>
          </Reveal>

          {/* Totals */}
          <Reveal delay={0.1}>
            <GlowCard className="p-6" glow="6, 182, 212" hover={false}>
              <h3 className="text-sm font-semibold text-white">Your brain</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Totals label="Memories" value={stats.totalMemories} icon={BookOpen} />
                <Totals label="Connections" value={stats.totalConnections} icon={Link2} />
              </div>
            </GlowCard>
          </Reveal>

          {/* Activity feed */}
          <Reveal delay={0.15}>
            <GlowCard className="p-6" hover={false}>
              <h3 className="mb-4 text-sm font-semibold text-white">Recent activity</h3>
              {feed.length === 0 ? (
                <p className="text-sm text-mnemo-muted">No activity yet.</p>
              ) : (
                <div className="relative space-y-4 before:absolute before:left-[7px] before:top-1 before:h-full before:w-px before:bg-white/[0.06]">
                  {feed.map((f, i) => (
                    <motion.div
                      key={f.id + i}
                      initial={{ opacity: 0, x: 6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="relative flex gap-3 pl-6"
                    >
                      <span
                        className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            f.type === "memory" ? "#7c3aed" : "#06b6d4",
                        }}
                      >
                        {f.type === "memory" ? (
                          <FileText className="h-2 w-2 text-white" />
                        ) : (
                          <Link2 className="h-2 w-2 text-white" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{f.title}</p>
                        <p className="text-[11px] text-mnemo-muted">
                          {clockTime(f.time)} · {relativeTime(f.time)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlowCard>
          </Reveal>

          {/* Quick actions */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction href="/chat" icon={MessageSquare} label="Ask AI" />
              <QuickAction href="/quiz" icon={Zap} label="Quick quiz" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function InsightRow({
  icon: Icon,
  color,
  label,
  value,
  pct,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  value: string | null;
  pct: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs text-mnemo-muted">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          {label}
        </span>
        {value && <span className="text-xs font-medium" style={{ color }}>{pct}%</span>}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-white">
        {value || "Not enough data yet"}
      </p>
      {value && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}

function Totals({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <Icon className="h-4 w-4 text-mnemo-muted" />
      <div className="mt-2 text-2xl font-semibold text-white">
        <AnimatedCounter value={value} />
      </div>
      <p className="text-xs text-mnemo-muted">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-mnemo-card/60 py-5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white/15"
    >
      <Icon className="h-5 w-5 text-mnemo-primary transition-transform group-hover:scale-110" />
      {label}
    </Link>
  );
}

function EmptyMini() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <BookOpen className="h-5 w-5 text-mnemo-muted" />
      </span>
      <p className="text-sm text-mnemo-muted">No memories yet.</p>
      <Link
        href="/capture"
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-black"
      >
        <Plus className="h-3.5 w-3.5" /> Capture your first memory
      </Link>
    </div>
  );
}
