"use client";

import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Brain,
  Network,
  BookOpen,
  Zap,
  FileText,
  Hash,
  Clock,
} from "lucide-react";

const categories = [
  { label: "AI & ML", count: 128, color: "#7c3aed" },
  { label: "Product", count: 86, color: "#06b6d4" },
  { label: "Design", count: 54, color: "#22c55e" },
  { label: "Startups", count: 39, color: "#f59e0b" },
];

const memories = [
  {
    icon: FileText,
    title: "Transformer attention is all you need",
    tag: "AI & ML",
    time: "2h ago",
  },
  {
    icon: BookOpen,
    title: "Naval on building specific knowledge",
    tag: "Startups",
    time: "5h ago",
  },
  {
    icon: Hash,
    title: "Design systems: tokens over components",
    tag: "Design",
    time: "1d ago",
  },
];

export function DashboardPreview() {
  return (
    <div className="relative w-full select-none">
      {/* Floating accent chips */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-24 z-20 hidden rounded-xl border border-white/10 bg-mnemo-card/90 px-3.5 py-2.5 shadow-glow-accent backdrop-blur-md lg:flex lg:items-center lg:gap-2"
      >
        <Zap className="h-4 w-4 text-mnemo-accent" />
        <span className="text-xs font-medium text-white">Instant recall</span>
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-5 top-52 z-20 hidden rounded-xl border border-white/10 bg-mnemo-card/90 px-3.5 py-2.5 shadow-glow-primary backdrop-blur-md lg:flex lg:items-center lg:gap-2"
      >
        <Sparkles className="h-4 w-4 text-mnemo-primary" />
        <span className="text-xs font-medium text-white">4 new connections</span>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-mnemo-card/80 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {/* Window bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-mnemo-muted" />
            <span className="text-xs text-mnemo-muted">
              Search your second brain…
            </span>
            <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-mnemo-muted">
              ⌘K
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0">
          {/* Sidebar */}
          <aside className="col-span-3 hidden flex-col gap-1 border-r border-white/[0.06] p-3 sm:flex">
            {[
              { icon: Brain, label: "All memories", active: true },
              { icon: Network, label: "Graph" },
              { icon: Sparkles, label: "AI Chat" },
              { icon: Clock, label: "Recent" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  item.active
                    ? "bg-mnemo-primary/15 text-white"
                    : "text-mnemo-muted"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
            ))}
            <div className="mt-3 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-mnemo-muted/60">
              Categories
            </div>
            {categories.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-mnemo-muted"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                </span>
                <span className="text-[10px] text-mnemo-muted/60">{c.count}</span>
              </div>
            ))}
          </aside>

          {/* Main */}
          <div className="col-span-12 p-4 sm:col-span-9 sm:p-5">
            {/* AI answer card */}
            <div className="rounded-xl border border-mnemo-primary/25 bg-gradient-to-br from-mnemo-primary/[0.12] to-transparent p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-mnemo-primary" />
                <span className="text-xs font-semibold text-white">
                  AI recalled 3 memories
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div className="h-2 w-[85%] rounded-full bg-white/10" />
                <div className="h-2 w-[62%] rounded-full bg-white/[0.06]" />
              </div>
            </div>

            {/* Recent memories */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Recent memories
                </span>
                <span className="text-[10px] text-mnemo-muted">View all</span>
              </div>
              {memories.map((m, i) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-mnemo-accent">
                    <m.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">
                      {m.title}
                    </p>
                    <p className="text-[10px] text-mnemo-muted">
                      {m.tag} · {m.time}
                    </p>
                  </div>
                  <span className="hidden h-6 items-center rounded-md border border-white/10 px-2 text-[10px] text-mnemo-muted sm:flex">
                    Linked
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Mini graph */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <MiniGraph />
              <div>
                <p className="text-xs font-semibold text-white">
                  Knowledge graph
                </p>
                <p className="text-[10px] text-mnemo-muted">
                  312 nodes · 1,204 connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniGraph() {
  const nodes = [
    { cx: 20, cy: 30, r: 5, c: "#7c3aed" },
    { cx: 55, cy: 15, r: 4, c: "#06b6d4" },
    { cx: 50, cy: 48, r: 6, c: "#22c55e" },
    { cx: 82, cy: 34, r: 4, c: "#f59e0b" },
    { cx: 30, cy: 55, r: 3.5, c: "#06b6d4" },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [2, 3],
    [2, 4],
    [1, 3],
  ];
  return (
    <svg viewBox="0 0 100 70" className="h-14 w-20 shrink-0">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="0.8"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 * i }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill={n.c}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 * i, type: "spring" }}
          style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur={`${2 + i * 0.4}s`}
            repeatCount="indefinite"
          />
        </motion.circle>
      ))}
    </svg>
  );
}
