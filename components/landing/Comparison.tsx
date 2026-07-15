"use client";

import { motion } from "framer-motion";
import { Check, X, Brain, Sparkles } from "lucide-react";
import { Section, SectionHeading, Reveal } from "./primitives";

const rows = [
  { label: "Semantic search speed", mnemo: "0.3s", others: "Keyword only" },
  { label: "AI memory & recall", mnemo: true, others: false },
  { label: "Knowledge graph", mnemo: true, others: false },
  { label: "Smart auto-recall", mnemo: true, others: false },
  { label: "Automatic organization", mnemo: true, others: "Manual" },
  { label: "Idea connections", mnemo: true, others: false },
  { label: "Chat with your notes", mnemo: true, others: false },
];

function Cell({ value, positive }: { value: boolean | string; positive: boolean }) {
  if (typeof value === "string") {
    return (
      <span
        className={`text-sm font-medium ${
          positive ? "text-white" : "text-mnemo-muted"
        }`}
      >
        {value}
      </span>
    );
  }
  return value ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mnemo-success/15 text-mnemo-success">
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-mnemo-muted">
      <X className="h-4 w-4" />
    </span>
  );
}

export function Comparison() {
  return (
    <Section id="comparison">
      <SectionHeading
        eyebrow="Comparison"
        eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="Not just another notes app"
        description="Traditional tools store text. Mnemo understands it — and gives it back exactly when you need it."
      />

      <Reveal className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-mnemo-card/50">
          {/* header */}
          <div className="grid grid-cols-3 border-b border-white/[0.08]">
            <div className="p-5 text-sm font-medium text-mnemo-muted">
              Capability
            </div>
            <div className="relative flex items-center justify-center gap-2 border-x border-white/[0.08] bg-gradient-to-b from-mnemo-primary/[0.12] to-transparent p-5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]">
                <Brain className="h-4 w-4 text-white" />
              </span>
              <span className="font-semibold text-white">Mnemo Brain</span>
            </div>
            <div className="flex items-center justify-center p-5 text-sm font-medium text-mnemo-muted">
              Traditional notes
            </div>
          </div>

          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-3 border-b border-white/[0.05] last:border-0"
            >
              <div className="flex items-center p-5 text-sm text-white">
                {row.label}
              </div>
              <div className="flex items-center justify-center border-x border-white/[0.05] bg-mnemo-primary/[0.04] p-5">
                <Cell value={row.mnemo} positive />
              </div>
              <div className="flex items-center justify-center p-5">
                <Cell value={row.others} positive={false} />
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
