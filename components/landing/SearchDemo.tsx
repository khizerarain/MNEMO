"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Search, Sparkles, FileText, CornerDownLeft, Brain } from "lucide-react";
import { Section, SectionHeading } from "./primitives";

const QUERY = "What was my idea about AI agents?";

const RESULTS = [
  {
    title: "Autonomous AI agents with tool use",
    snippet:
      "Idea: agents that plan, call tools, and self-correct in a loop. Could pair with a memory store for long-horizon tasks.",
    tag: "AI & ML",
    score: 0.97,
  },
  {
    title: "Multi-agent orchestration notes",
    snippet:
      "A manager agent delegates to specialists. Shared scratchpad = shared memory. Cheaper than one giant model.",
    tag: "Research",
    score: 0.91,
  },
];

const ANSWER =
  "You captured this idea 3 weeks ago: an autonomous AI agent that plans tasks, uses tools, and self-corrects — backed by a persistent memory store for long-horizon goals. You linked it to your multi-agent orchestration notes.";

export function SearchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "thinking" | "done">(
    "idle"
  );

  useEffect(() => {
    if (!inView || phase !== "idle") return;
    setPhase("typing");
    let i = 0;
    const typeInterval = setInterval(() => {
      i += 1;
      setTyped(QUERY.slice(0, i));
      if (i >= QUERY.length) {
        clearInterval(typeInterval);
        setPhase("thinking");
        setTimeout(() => setPhase("done"), 1300);
      }
    }, 45);
    return () => clearInterval(typeInterval);
  }, [inView, phase]);

  return (
    <Section id="search-demo">
      <SectionHeading
        eyebrow="AI Search"
        eyebrowIcon={<Search className="h-3.5 w-3.5" />}
        title="Ask anything. Remember everything."
        description="Type a question the way you think it. Mnemo understands meaning and instantly recalls the exact memory you need."
      />

      <div ref={ref} className="mx-auto mt-12 max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-mnemo-card/70 shadow-[0_40px_120px_-40px_rgba(124,58,237,0.5)] backdrop-blur-xl">
          {/* input */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
            <Search className="h-5 w-5 text-mnemo-primary" />
            <div className="flex-1 text-base text-white">
              {typed || (
                <span className="text-mnemo-muted">Ask your second brain…</span>
              )}
              {phase === "typing" && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-0.5 inline-block h-5 w-px translate-y-1 bg-white"
                />
              )}
            </div>
            <kbd className="hidden items-center gap-1 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-mnemo-muted sm:flex">
              <CornerDownLeft className="h-3 w-3" /> Enter
            </kbd>
          </div>

          <div className="min-h-[280px] p-5">
            <AnimatePresence mode="wait">
              {phase === "thinking" && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-sm text-mnemo-muted"
                >
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mnemo-primary opacity-60" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-mnemo-primary" />
                  </span>
                  Searching 512 memories…
                </motion.div>
              )}

              {phase === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* AI answer */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-mnemo-primary/25 bg-gradient-to-br from-mnemo-primary/[0.12] to-transparent p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-mnemo-primary" />
                      <span className="text-xs font-semibold text-white">
                        AI answer
                      </span>
                    </div>
                    <StreamText text={ANSWER} />
                  </motion.div>

                  <div className="flex items-center gap-2 text-xs font-medium text-mnemo-muted">
                    <Brain className="h-3.5 w-3.5" /> Sources from your memory
                  </div>

                  {RESULTS.map((r, i) => (
                    <motion.div
                      key={r.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-white/15"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-mnemo-accent">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-white">
                            {r.title}
                          </p>
                          <span className="shrink-0 font-mono text-[10px] text-mnemo-accent">
                            {r.score.toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-mnemo-muted">
                          {r.snippet}
                        </p>
                        <span className="mt-2 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mnemo-muted">
                          {r.tag}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {(phase === "idle" || phase === "typing") && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[240px] items-center justify-center text-sm text-mnemo-muted"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Results will appear here
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  );
}

function StreamText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);
  return (
    <p className="text-sm leading-relaxed text-white/90">
      {shown}
      {shown.length < text.length && (
        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-mnemo-primary" />
      )}
    </p>
  );
}
