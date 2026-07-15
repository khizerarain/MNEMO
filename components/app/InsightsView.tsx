"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Trophy,
  AlertTriangle,
  CalendarClock,
  Link2,
  Flame,
  TrendingUp,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/landing/primitives";
import { GlowCard } from "@/components/app/widgets";
import { PageHeader } from "@/components/app/AppShell";
import { hexToRgb } from "@/lib/knowledge";

const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  trophy: Trophy,
  alert: AlertTriangle,
  calendar: CalendarClock,
  link: Link2,
  flame: Flame,
  trend: TrendingUp,
  bulb: Lightbulb,
};

export type Insight = {
  id: string;
  icon: string;
  title: string;
  body: string;
  accent: string;
  metric?: string;
};

export function InsightsView({
  insights,
  summary,
}: {
  insights: Insight[];
  summary: string;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <PageHeader
        title="AI Insights"
        description="Mnemo continuously analyzes how you learn and remember."
      />

      {/* Hero summary */}
      <Reveal>
        <GlowCard className="overflow-hidden p-7" glow="124, 58, 237" hover={false}>
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-mnemo-primary/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-mnemo-accent/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8] shadow-glow-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-mnemo-primary">
                Brain analysis
              </p>
              <p className="mt-1.5 text-lg font-medium leading-relaxed text-white">
                {summary}
              </p>
            </div>
          </div>
        </GlowCard>
      </Reveal>

      {/* Insight cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {insights.map((ins, i) => {
          const Icon = ICONS[ins.icon] || Lightbulb;
          return (
            <Reveal key={ins.id} delay={i * 0.06}>
              <GlowCard glow={hexToRgb(ins.accent)} className="h-full p-6">
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${ins.accent}1f`, color: ins.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {ins.metric && (
                    <span
                      className="text-2xl font-semibold"
                      style={{ color: ins.accent }}
                    >
                      {ins.metric}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{ins.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mnemo-muted">{ins.body}</p>
              </GlowCard>
            </Reveal>
          );
        })}
      </div>

      {insights.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-2xl border border-white/[0.06] bg-mnemo-card/40 py-16 text-center"
        >
          <Sparkles className="mx-auto h-8 w-8 text-mnemo-muted" />
          <p className="mt-3 text-sm text-mnemo-muted">
            Capture and review more memories to unlock personalized insights.
          </p>
        </motion.div>
      )}
    </div>
  );
}
