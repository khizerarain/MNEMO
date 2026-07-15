"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Brain,
  TrendingUp,
  Target,
  Link2,
  BookOpen,
  GraduationCap,
  Layers,
} from "lucide-react";
import { Reveal, AnimatedCounter } from "@/components/landing/primitives";
import {
  GlowCard,
  ContributionHeatmap,
  ProgressRing,
  BarChart,
} from "@/components/app/widgets";
import { PageHeader } from "@/components/app/AppShell";
import { colorForKey } from "@/lib/knowledge";

export type AnalyticsData = {
  streak: number;
  retentionPct: number;
  reviewCoverage: number;
  totalMemories: number;
  totalConnections: number;
  totalCards: number;
  masteredCards: number;
  avgConnections: number;
  growth: { label: string; value: number }[];
  weekly: { label: string; value: number }[];
  topics: { name: string; count: number }[];
  heatmap: Record<string, number>;
};

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const kpis = [
    { label: "Day streak", value: data.streak, icon: Flame, color: "#f59e0b", suffix: "" },
    { label: "Retention score", value: data.retentionPct, icon: Brain, color: "#7c3aed", suffix: "%" },
    { label: "Cards mastered", value: data.masteredCards, icon: Target, color: "#22c55e", suffix: "" },
    { label: "Avg connections", value: data.avgConnections, icon: Link2, color: "#06b6d4", suffix: "", decimals: 1 },
  ];
  const maxTopic = Math.max(1, ...data.topics.map((t) => t.count));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        title="Analytics"
        description="Track how your knowledge compounds over time."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.05}>
            <GlowCard glow="124, 58, 237" className="p-5">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${k.color}1f`, color: k.color }}
              >
                <k.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-3xl font-semibold text-white">
                <AnimatedCounter value={k.value} suffix={k.suffix} decimals={k.decimals || 0} />
              </div>
              <p className="mt-1 text-sm text-mnemo-muted">{k.label}</p>
            </GlowCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Growth */}
        <Reveal className="lg:col-span-2">
          <GlowCard className="p-6" hover={false}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Knowledge growth</h3>
                <p className="text-xs text-mnemo-muted">Memories captured per month</p>
              </div>
              <TrendingUp className="h-4 w-4 text-mnemo-success" />
            </div>
            <BarChart data={data.growth} color="#7c3aed" height={160} />
          </GlowCard>
        </Reveal>

        {/* Retention ring */}
        <Reveal delay={0.05}>
          <GlowCard className="flex flex-col items-center p-6" glow="34,197,94" hover={false}>
            <h3 className="mb-4 self-start text-sm font-semibold text-white">
              Recall strength
            </h3>
            <ProgressRing progress={data.retentionPct / 100} size={140} stroke={12} color="#22c55e">
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">
                  <AnimatedCounter value={data.retentionPct} suffix="%" />
                </div>
                <div className="text-[11px] text-mnemo-muted">retention</div>
              </div>
            </ProgressRing>
            <p className="mt-4 text-center text-xs text-mnemo-muted">
              Based on spaced-repetition performance across {data.totalCards} cards
            </p>
          </GlowCard>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Weekly activity */}
        <Reveal>
          <GlowCard className="p-6" hover={false}>
            <h3 className="mb-6 text-sm font-semibold text-white">This week</h3>
            <BarChart data={data.weekly} color="#06b6d4" height={140} />
          </GlowCard>
        </Reveal>

        {/* Top topics */}
        <Reveal delay={0.05} className="lg:col-span-2">
          <GlowCard className="p-6" hover={false}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Most learned topics</h3>
              <Layers className="h-4 w-4 text-mnemo-muted" />
            </div>
            {data.topics.length === 0 ? (
              <p className="text-sm text-mnemo-muted">Capture memories to see your top topics.</p>
            ) : (
              <div className="space-y-3">
                {data.topics.map((t, i) => {
                  const c = colorForKey(t.name);
                  return (
                    <div key={t.name} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 truncate text-sm text-white">{t.name}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(t.count / maxTopic) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.06 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: c }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs text-mnemo-muted">
                        {t.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </GlowCard>
        </Reveal>
      </div>

      {/* Heatmap */}
      <Reveal className="mt-4">
        <GlowCard className="p-6" hover={false}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Activity heatmap</h3>
              <p className="text-xs text-mnemo-muted">Every capture and connection</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-mnemo-muted">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {data.totalMemories}
              </span>
              <span className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> {data.totalConnections}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> {data.totalCards}
              </span>
            </div>
          </div>
          <ContributionHeatmap counts={data.heatmap} weeks={30} />
        </GlowCard>
      </Reveal>
    </div>
  );
}
