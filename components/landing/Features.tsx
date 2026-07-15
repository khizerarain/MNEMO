"use client";

import { motion } from "framer-motion";
import {
  Database,
  Search,
  Network,
  Layers,
  Sparkles,
  Workflow,
  Clock,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading, Reveal, SpotlightCard } from "./primitives";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  glow: string;
  className: string;
  visual?: "search" | "graph" | "connections";
};

const features: Feature[] = [
  {
    icon: Database,
    title: "AI Memory Storage",
    body: "Save articles, notes, and fleeting thoughts. Mnemo reads and understands the meaning of every memory automatically.",
    glow: "124, 58, 237",
    className: "md:col-span-2",
    visual: "search",
  },
  {
    icon: Search,
    title: "Instant Search",
    body: "Semantic search that understands intent, not just keywords. Find anything in milliseconds.",
    glow: "6, 182, 212",
    className: "",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
    body: "Watch your ideas connect into a living network of understanding.",
    glow: "34, 197, 94",
    className: "",
    visual: "graph",
  },
  {
    icon: Layers,
    title: "Smart Organization",
    body: "Auto-tagged, auto-categorized. Your library organizes itself so you never file another note by hand.",
    glow: "245, 158, 11",
    className: "md:col-span-2",
    visual: "connections",
  },
  {
    icon: Sparkles,
    title: "AI Retrieval",
    body: "Ask questions in plain language and get answers grounded in your own knowledge.",
    glow: "124, 58, 237",
    className: "",
  },
  {
    icon: Workflow,
    title: "Context Awareness",
    body: "Mnemo remembers what you were working on and surfaces relevant memories at the right moment.",
    glow: "6, 182, 212",
    className: "",
  },
  {
    icon: Clock,
    title: "Productivity Tracking",
    body: "See what you learn and how your knowledge compounds over time.",
    glow: "34, 197, 94",
    className: "",
  },
  {
    icon: Link2,
    title: "Memory Connections",
    body: "Discover unexpected links between ideas you never knew were related.",
    glow: "245, 158, 11",
    className: "",
  },
];

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Features"
        eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="Everything you need to think clearly"
        description="A complete toolkit for capturing, connecting, and recalling everything that matters — powered by intelligent memory."
      />

      <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.06} className={f.className}>
            <SpotlightCard glow={f.glow} className="h-full">
              <div className="flex h-full flex-col p-6">
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]"
                  style={{ boxShadow: `0 8px 30px -10px rgba(${f.glow},0.5)` }}
                >
                  <f.icon
                    className="h-5 w-5"
                    style={{ color: `rgb(${f.glow})` }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mnemo-muted">
                  {f.body}
                </p>

                {f.visual === "search" && <SearchVisual />}
                {f.visual === "graph" && <GraphVisual glow={f.glow} />}
                {f.visual === "connections" && <ConnectionsVisual />}
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function SearchVisual() {
  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-mnemo-accent" />
        <span className="text-xs text-mnemo-muted">
          neural nets for time series
        </span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-0.5 h-3.5 w-px bg-white"
        />
      </div>
      {["Temporal fusion transformers", "LSTM vs attention", "Forecasting notes"].map(
        (r, i) => (
          <motion.div
            key={r}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          >
            <span className="text-xs text-white">{r}</span>
            <span className="font-mono text-[10px] text-mnemo-accent">
              {(0.98 - i * 0.07).toFixed(2)}
            </span>
          </motion.div>
        )
      )}
    </div>
  );
}

function GraphVisual({ glow }: { glow: string }) {
  const nodes = [
    { cx: 30, cy: 40 },
    { cx: 70, cy: 25 },
    { cx: 100, cy: 55 },
    { cx: 60, cy: 70 },
    { cx: 130, cy: 32 },
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 4],
    [2, 3],
    [0, 3],
  ];
  return (
    <div className="mt-auto pt-5">
      <svg viewBox="0 0 160 90" className="h-24 w-full">
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].cx}
            y1={nodes[a].cy}
            x2={nodes[b].cx}
            y2={nodes[b].cy}
            stroke={`rgba(${glow},0.4)`}
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.cx} cy={n.cy} r={i === 1 ? 6 : 4} fill={`rgb(${glow})`}>
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}

function ConnectionsVisual() {
  const tags = [
    { label: "AI & ML", c: "#7c3aed" },
    { label: "Research", c: "#06b6d4" },
    { label: "Product", c: "#22c55e" },
    { label: "Design", c: "#f59e0b" },
    { label: "Startups", c: "#ec4899" },
    { label: "Philosophy", c: "#8b5cf6" },
  ];
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <motion.span
          key={t.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="rounded-full border px-3 py-1 text-xs font-medium"
          style={{
            color: t.c,
            borderColor: `${t.c}40`,
            backgroundColor: `${t.c}12`,
          }}
        >
          {t.label}
        </motion.span>
      ))}
    </div>
  );
}
