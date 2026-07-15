"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Type,
  Globe,
  FileText,
  Video,
  Mic,
  Newspaper,
  Sparkles,
  Loader2,
  Check,
  ArrowRight,
  Brain,
  Lightbulb,
  Network,
  GraduationCap,
  RotateCcw,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { GlowCard, ProgressRing } from "@/components/app/widgets";
import { cn } from "@/lib/utils";

type Idea = { insight: string; question: string; answer: string };
type SavedMemory = { id: string; title: string; ideas: Idea[] };

const inputs = [
  { id: "text", label: "Paste Text", icon: Type, enabled: true },
  { id: "link", label: "Website URL", icon: Globe, enabled: true },
  { id: "article", label: "Article", icon: Newspaper, enabled: false },
  { id: "pdf", label: "Upload PDF", icon: FileText, enabled: false },
  { id: "youtube", label: "YouTube", icon: Video, enabled: false },
  { id: "voice", label: "Voice Note", icon: Mic, enabled: false },
];

const pipeline = [
  { label: "Reading your content", icon: Brain },
  { label: "Extracting key ideas", icon: Lightbulb },
  { label: "Creating flashcards", icon: GraduationCap },
  { label: "Building graph nodes", icon: Network },
  { label: "Generating quiz questions", icon: Sparkles },
];

export function CaptureWorkspace() {
  const [tab, setTab] = useState("text");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedMemory | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

  // advance pipeline animation while loading
  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s < pipeline.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(id);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setWarning(null);
    setSaved(null);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sourceUrl: sourceUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save memory");
      setStep(pipeline.length - 1);
      await new Promise((r) => setTimeout(r, 400));
      setSaved(data.memory);
      if (data.warning) setWarning(data.warning);
      setContent("");
      setSourceUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const activeInput = inputs.find((i) => i.id === tab)!;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <PageHeader
        title="Capture workspace"
        description="Drop in anything you're learning. Mnemo turns it into structured, connected memory."
      />

      {/* Input type selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {inputs.map((i) => (
          <button
            key={i.id}
            disabled={!i.enabled}
            onClick={() => i.enabled && setTab(i.id)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all",
              tab === i.id && i.enabled
                ? "border-white/20 bg-white/[0.07] text-white"
                : i.enabled
                ? "border-white/[0.07] text-mnemo-muted hover:border-white/15 hover:text-white"
                : "cursor-not-allowed border-white/[0.04] text-mnemo-muted/40"
            )}
          >
            <i.icon className="h-4 w-4" />
            {i.label}
            {!i.enabled && <Lock className="h-3 w-3" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <ProcessingView key="loading" step={step} />
        ) : saved ? (
          <ResultView
            key="result"
            memory={saved}
            warning={warning}
            flipped={flipped}
            setFlipped={setFlipped}
            onReset={() => setSaved(null)}
          />
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GlowCard className="p-6" hover={false}>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!activeInput.enabled ? (
                  <ComingSoon input={activeInput.label} />
                ) : (
                  <>
                    {tab === "link" && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white">
                          URL
                        </label>
                        <input
                          type="url"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-white placeholder:text-mnemo-muted focus:border-mnemo-primary focus:outline-none focus:ring-1 focus:ring-mnemo-primary"
                        />
                        <p className="mt-1.5 text-xs text-mnemo-muted">
                          Paste the URL and the key text below — Mnemo will link the source.
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-white">
                          {tab === "link" ? "Content" : "What did you learn?"}
                        </label>
                        <span className="text-xs text-mnemo-muted">{wordCount} words</span>
                      </div>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        placeholder="Paste an article, notes, a lesson, a fleeting thought… Mnemo reads it and extracts the essence."
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3.5 text-sm leading-relaxed text-white placeholder:text-mnemo-muted focus:border-mnemo-primary focus:outline-none focus:ring-1 focus:ring-mnemo-primary"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                        {error}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="hidden items-center gap-1.5 text-xs text-mnemo-muted sm:flex">
                        <Sparkles className="h-3.5 w-3.5 text-mnemo-primary" />
                        AI extracts ideas, flashcards, quiz & connections automatically
                      </p>
                      <button
                        type="submit"
                        disabled={content.trim().length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_28px_-6px_rgba(255,255,255,0.6)] disabled:opacity-40 disabled:hover:shadow-none"
                      >
                        <Sparkles className="h-4 w-4" />
                        Process with AI
                      </button>
                    </div>
                  </>
                )}
              </form>
            </GlowCard>

            {/* What happens next */}
            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {pipeline.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.05] bg-mnemo-card/40 p-4 text-center"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mnemo-primary/10 text-mnemo-primary">
                    <p.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] leading-tight text-mnemo-muted">
                    {p.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProcessingView({ step }: { step: number }) {
  const progress = (step + 1) / pipeline.length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <GlowCard className="flex flex-col items-center p-10" hover={false}>
        <div className="relative">
          <ProgressRing progress={progress} size={92} stroke={7}>
            <Brain className="h-8 w-8 animate-pulse text-mnemo-primary" />
          </ProgressRing>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-white">
          Building your memory…
        </h3>
        <div className="mt-6 w-full max-w-sm space-y-2.5">
          {pipeline.map((p, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={p.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  active && "bg-white/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    done
                      ? "bg-mnemo-success/20 text-mnemo-success"
                      : active
                      ? "bg-mnemo-primary/20 text-mnemo-primary"
                      : "bg-white/5 text-mnemo-muted"
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <p.icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    done || active ? "text-white" : "text-mnemo-muted"
                  )}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </GlowCard>
    </motion.div>
  );
}

function ResultView({
  memory,
  warning,
  flipped,
  setFlipped,
  onReset,
}: {
  memory: SavedMemory;
  warning: string | null;
  flipped: number | null;
  setFlipped: (i: number | null) => void;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-mnemo-success/20 bg-mnemo-success/10 px-4 py-3">
        <Check className="h-5 w-5 text-mnemo-success" />
        <span className="text-sm font-medium text-white">
          Memory saved and processed successfully
        </span>
      </div>

      {warning && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {warning}
        </div>
      )}

      <GlowCard className="p-6" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mnemo-primary/15 px-2.5 py-1 text-[11px] font-medium text-mnemo-primary">
              <Sparkles className="h-3 w-3" /> AI generated
            </span>
            <h2 className="mt-3 text-xl font-semibold text-white">{memory.title}</h2>
            <p className="mt-1 text-sm text-mnemo-muted">
              {memory.ideas.length} ideas · {memory.ideas.length} flashcards ·{" "}
              {memory.ideas.length} quiz questions
            </p>
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-mnemo-muted">
          Flashcards — tap to flip
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {memory.ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => setFlipped(flipped === i ? null : i)}
              className="relative h-32 text-left [perspective:1000px]"
            >
              <motion.div
                className="relative h-full w-full [transform-style:preserve-3d]"
                animate={{ rotateY: flipped === i ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 [backface-visibility:hidden]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-mnemo-primary">
                    Question
                  </span>
                  <p className="text-sm text-white">{idea.question}</p>
                  <span className="text-[10px] text-mnemo-muted">Tap to reveal</span>
                </div>
                <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-mnemo-primary/25 bg-mnemo-primary/[0.08] p-4 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-mnemo-accent">
                    Answer
                  </span>
                  <p className="text-sm text-white">{idea.answer}</p>
                  <span className="text-[10px] text-mnemo-muted">{idea.insight.slice(0, 40)}…</span>
                </div>
              </motion.div>
            </button>
          ))}
        </div>
      </GlowCard>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onReset}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 text-sm font-semibold text-white transition-colors hover:border-white/25"
        >
          <RotateCcw className="h-4 w-4" /> Capture another
        </button>
        <Link
          href="/memories"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black"
        >
          View in memories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function ComingSoon({ input }: { input: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Lock className="h-5 w-5 text-mnemo-muted" />
      </span>
      <p className="text-base font-medium text-white">{input} import is coming soon</p>
      <p className="max-w-sm text-sm text-mnemo-muted">
        We&apos;re polishing this input. For now, paste the text directly and Mnemo
        will do the rest.
      </p>
    </div>
  );
}
