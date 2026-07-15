"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Network,
  GraduationCap,
  Star,
  FileText,
} from "lucide-react";
import { AuroraBackground, Particles } from "@/components/landing/primitives";

const floatingCards = [
  { icon: FileText, label: "12 memories today", color: "#7c3aed", x: "6%", y: "22%", d: 0 },
  { icon: Network, label: "Football ↔ Economics", color: "#06b6d4", x: "58%", y: "14%", d: 0.6 },
  { icon: GraduationCap, label: "92% recall", color: "#22c55e", x: "10%", y: "68%", d: 1.2 },
];

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#080808] lg:block">
      <AuroraBackground />
      <Particles quantity={40} color="124,58,237" />
      <div className="absolute inset-0 bg-grid-mnemo opacity-[0.5] mask-radial-faded" />

      {/* Floating cards */}
      {floatingCards.map((c, i) => (
        <motion.div
          key={i}
          className="absolute z-10 hidden xl:flex"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { delay: 0.3 + c.d, duration: 0.6 },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: c.d },
          }}
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${c.color}22`, color: c.color }}
            >
              <c.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-white">{c.label}</span>
          </div>
        </motion.div>
      ))}

      <div className="relative z-20 flex h-full flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8] shadow-glow-primary">
            <Brain className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            Mnemo<span className="text-mnemo-muted">Brain</span>
          </span>
        </div>

        <div className="max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-mnemo-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-mnemo-primary" />
            Your AI second brain
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-4xl font-semibold leading-tight tracking-tight text-white"
          >
            Capture ideas.
            <br />
            <span className="text-gradient-mnemo">Connect knowledge.</span>
            <br />
            Never forget.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4 text-base leading-relaxed text-mnemo-muted"
          >
            The operating system for your mind — where ChatGPT, Notion, Obsidian,
            and Perplexity meet.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b"].map((c) => (
              <span
                key={c}
                className="h-8 w-8 rounded-full border-2 border-[#080808]"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-mnemo-muted">Loved by 10,000+ curious minds</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
