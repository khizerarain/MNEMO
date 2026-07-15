"use client";

import { motion } from "framer-motion";
import { BookOpen, Workflow, Sparkles, ArrowRight } from "lucide-react";
import { Section, SectionHeading, Reveal } from "./primitives";

const steps = [
  {
    n: "01",
    icon: BookOpen,
    title: "Capture",
    body: "Drop in an article, a note, a voice memo, or a passing thought. Mnemo reads it, understands it, and extracts the essence.",
    color: "#7c3aed",
  },
  {
    n: "02",
    icon: Workflow,
    title: "Connect",
    body: "Every memory is compared against everything you know. Mnemo weaves new ideas into your growing knowledge graph automatically.",
    color: "#06b6d4",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Recall",
    body: "Ask a question in plain language and get the exact answer — grounded in your own memories — in a fraction of a second.",
    color: "#22c55e",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow="How it works"
        eyebrowIcon={<Workflow className="h-3.5 w-3.5" />}
        title="Three steps to a smarter mind"
        description="No complex setup. No manual filing. Just capture, and let intelligent memory do the rest."
      />

      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-20 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 0.12}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-mnemo-card/50 p-7 transition-colors hover:border-white/15">
              <div
                className="absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-15 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
                style={{ backgroundColor: step.color }}
              />
              <div className="relative flex items-center justify-between">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/40 transition-transform duration-300 group-hover:scale-105"
                  style={{ color: step.color }}
                >
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="font-mono text-4xl font-bold text-white/10">
                  {step.n}
                </span>
              </div>
              <h3 className="relative mt-6 text-2xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="relative mt-3 leading-relaxed text-mnemo-muted">
                {step.body}
              </p>
              {i < steps.length - 1 && (
                <motion.div
                  aria-hidden
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-mnemo-bg text-mnemo-muted md:flex"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
