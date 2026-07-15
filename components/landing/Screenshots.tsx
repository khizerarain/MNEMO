"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Database,
  Network,
  MessageSquare,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "./primitives";

type Shot = {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  body: string;
  accent: string;
};

const shots: Shot[] = [
  {
    id: "search",
    label: "Search",
    icon: Search,
    title: "Semantic search",
    body: "Ask in natural language. Mnemo ranks every memory by meaning and relevance.",
    accent: "#06b6d4",
  },
  {
    id: "storage",
    label: "Memory Storage",
    icon: Database,
    title: "Effortless capture",
    body: "Save from anywhere. AI extracts the key ideas and tags them instantly.",
    accent: "#7c3aed",
  },
  {
    id: "graph",
    label: "Knowledge Graph",
    icon: Network,
    title: "Visual thinking",
    body: "Navigate your knowledge as a connected, explorable network.",
    accent: "#22c55e",
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: MessageSquare,
    title: "Chat with your brain",
    body: "A research assistant grounded entirely in what you already know.",
    accent: "#f59e0b",
  },
  {
    id: "dashboard",
    label: "Organization",
    icon: Layers,
    title: "Self-organizing library",
    body: "Categories, tags, and collections that maintain themselves.",
    accent: "#ec4899",
  },
];

export function Screenshots() {
  const [active, setActive] = useState(shots[0]);

  return (
    <Section id="showcase">
      <SectionHeading
        eyebrow="Product tour"
        eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="See Mnemo in action"
        description="A polished, fast, and thoughtful interface for every part of your knowledge workflow."
      />

      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {shots.map((s) => {
          const on = active.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                on
                  ? "border-white/20 bg-white/[0.08] text-white"
                  : "border-white/[0.06] text-mnemo-muted hover:border-white/15 hover:text-white"
              }`}
            >
              <s.icon
                className="h-4 w-4"
                style={{ color: on ? s.accent : undefined }}
              />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="relative mt-10">
        <div
          className="pointer-events-none absolute -inset-x-10 -top-6 bottom-0 -z-10 blur-3xl transition-colors duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${active.accent}22, transparent 70%)`,
          }}
        />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-mnemo-card/60 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
          {/* browser frame */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <div className="mx-auto flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/30 px-4 py-1 text-[11px] text-mnemo-muted">
              app.mnemobrain.ai/{active.id}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="grid min-h-[360px] gap-6 p-6 sm:p-10 md:grid-cols-2 md:items-center"
            >
              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    color: active.accent,
                    backgroundColor: `${active.accent}1a`,
                  }}
                >
                  <active.icon className="h-3.5 w-3.5" />
                  {active.label}
                </span>
                <h3 className="mt-4 text-3xl font-semibold text-white">
                  {active.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-mnemo-muted">
                  {active.body}
                </p>
              </div>
              <MockPanel shot={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

function MockPanel({ shot }: { shot: Shot }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${shot.accent}1a`, color: shot.accent }}
        >
          <shot.icon className="h-4 w-4" />
        </span>
        <div className="h-2.5 w-28 rounded-full bg-white/10" />
      </div>
      <div className="space-y-2.5">
        {[100, 82, 68, 90, 55].map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: i * 0.08 }}
            style={{ originX: 0, width: `${w}%` }}
            className="flex items-center gap-2"
          >
            <span
              className="h-2 rounded-full"
              style={{
                width: i % 2 === 0 ? "40%" : "24%",
                backgroundColor: `${shot.accent}66`,
              }}
            />
            <span className="h-2 flex-1 rounded-full bg-white/[0.07]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
