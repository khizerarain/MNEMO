"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Trophy,
  RotateCcw,
  Zap,
  Brain,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { GlowCard, ProgressRing } from "@/components/app/widgets";
import { deriveTopic, colorForKey } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

type Idea = { insight: string; question: string; answer: string };
export type QuizCardData = {
  id: string;
  question: string;
  answer: string;
  easiness_factor: number;
  memory: { id: string; title: string; ideas: Idea[] };
};

const RATINGS = [
  { key: "forgot", label: "Forgot", quality: 0, color: "#ef4444" },
  { key: "hard", label: "Hard", quality: 2, color: "#f59e0b" },
  { key: "good", label: "Good", quality: 4, color: "#06b6d4" },
  { key: "easy", label: "Easy", quality: 5, color: "#22c55e" },
] as const;

function difficulty(ef: number): { label: string; color: string } {
  if (ef < 1.8) return { label: "Hard", color: "#ef4444" };
  if (ef < 2.3) return { label: "Medium", color: "#f59e0b" };
  return { label: "Easy", color: "#22c55e" };
}

function buildOptions(card: QuizCardData) {
  const correct = card.answer.trim();
  const others = card.memory.ideas
    .filter((i) => i.answer.trim() !== correct)
    .map((i) => i.answer.trim())
    .filter((v, i, a) => a.indexOf(v) === i);
  const fallback = ["Not mentioned in the content", "None of the above", "All of the above"];
  const distractors =
    others.length >= 3 ? others.slice(0, 3) : [...others, ...fallback.slice(0, 3 - others.length)];
  const options = [correct, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, correctIndex: options.indexOf(correct) };
}

export function QuizRunner({ cards }: { cards: QuizCardData[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[index];
  const { options, correctIndex } = useMemo(() => buildOptions(card), [card]);

  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [index]);

  const explanation = useMemo(() => {
    const match = card.memory.ideas.find(
      (i) => i.answer.trim() === card.answer.trim()
    );
    return match?.insight || card.memory.ideas[0]?.insight || "";
  }, [card]);

  function pick(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === correctIndex) setCorrectCount((c) => c + 1);
  }

  async function rate(quality: number) {
    if (saving) return;
    setSaving(true);
    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quality }),
      });
    } catch {
      /* keep going even if save fails */
    } finally {
      setSaving(false);
      if (index + 1 < cards.length) setIndex((i) => i + 1);
      else setDone(true);
    }
  }

  const topic = deriveTopic(card?.memory.title || "");
  const diff = difficulty(card?.easiness_factor ?? 2.5);

  if (done) {
    const pct = Math.round((correctCount / cards.length) * 100);
    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <GlowCard className="flex flex-col items-center p-10 text-center" glow="34,197,94" hover={false}>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mnemo-success/15 text-mnemo-success">
              <Trophy className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-2xl font-semibold text-white">Session complete</h2>
            <p className="mt-1.5 text-mnemo-muted">
              You recalled {correctCount} of {cards.length} correctly.
            </p>
            <div className="my-6">
              <ProgressRing progress={pct / 100} size={120} stroke={10} color="#22c55e">
                <div className="text-2xl font-semibold text-white">{pct}%</div>
              </ProgressRing>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.refresh()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25"
              >
                <RotateCcw className="h-4 w-4" /> Check for more
              </button>
              <Link
                href="/dashboard"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black"
              >
                Back to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <PageHeader title="Review & Quiz" description="Spaced repetition keeps your memories sharp." />

      {/* Progress */}
      <div className="mb-6 flex items-center gap-4">
        <ProgressRing progress={(index + (revealed ? 1 : 0)) / cards.length} size={52} stroke={5}>
          <span className="text-[11px] font-semibold text-white">
            {index + 1}/{cards.length}
          </span>
        </ProgressRing>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-mnemo-primary to-mnemo-accent"
              animate={{ width: `${(index / cards.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="flex items-center gap-1 text-sm text-mnemo-muted">
          <Zap className="h-4 w-4 text-mnemo-accent" /> {correctCount}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <GlowCard className="p-6 sm:p-7" hover={false}>
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ color: colorForKey(topic), backgroundColor: `${colorForKey(topic)}16` }}
              >
                {topic}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ color: diff.color, backgroundColor: `${diff.color}16` }}
              >
                {diff.label}
              </span>
              <span className="ml-auto truncate text-xs text-mnemo-muted">
                {card.memory.title}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold leading-snug text-white">
              {card.question}
            </h2>

            <div className="mt-5 space-y-2.5">
              {options.map((opt, i) => {
                const isCorrect = i === correctIndex;
                const isSelected = i === selected;
                let style =
                  "border-white/[0.08] bg-white/[0.02] hover:border-white/20 text-white/90";
                if (revealed) {
                  if (isCorrect)
                    style = "border-mnemo-success/40 bg-mnemo-success/10 text-white";
                  else if (isSelected)
                    style = "border-red-500/40 bg-red-500/10 text-white";
                  else style = "border-white/[0.05] bg-transparent text-mnemo-muted";
                }
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={revealed}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      style
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 text-xs font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isCorrect && <Check className="h-4 w-4 text-mnemo-success" />}
                    {revealed && isSelected && !isCorrect && <X className="h-4 w-4 text-red-400" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl border border-mnemo-primary/20 bg-mnemo-primary/[0.06] p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-mnemo-primary" />
                      <span className="text-xs font-semibold text-white">
                        {selected === correctIndex ? "Correct!" : "The answer is"}{" "}
                        <span className="text-mnemo-accent">{card.answer}</span>
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/80">{explanation}</p>
                  </div>

                  {/* Spaced repetition ratings */}
                  <div className="mt-5">
                    <p className="mb-2 flex items-center gap-1.5 text-xs text-mnemo-muted">
                      <Brain className="h-3.5 w-3.5" /> How well did you know this?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {RATINGS.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => rate(r.quality)}
                          disabled={saving}
                          className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] py-3 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                          style={{ ["--c" as string]: r.color }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: r.color }}
                          />
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlowCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
