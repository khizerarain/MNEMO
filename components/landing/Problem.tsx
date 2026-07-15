"use client";

import { motion } from "framer-motion";
import { Brain, CloudRain, Sparkles } from "lucide-react";
import { Section, SectionHeading, Reveal } from "./primitives";

const steps = [
  {
    stage: "The problem",
    icon: CloudRain,
    title: "You consume more than you can remember",
    body: "Articles, podcasts, conversations, sparks of insight — thousands of ideas pass through you every week. Within days, 90% are gone forever.",
    color: "#f59e0b",
    stat: "90%",
    statLabel: "of new information is forgotten within a week",
  },
  {
    stage: "The frustration",
    icon: Brain,
    title: "Notes apps become graveyards",
    body: "You save everything into folders and docs you never open again. Search is keyword-only. Your best ideas are buried and disconnected.",
    color: "#ef4444",
    stat: "76",
    statLabel: "notes saved for every one you ever reopen",
  },
  {
    stage: "The solution",
    icon: Sparkles,
    title: "A brain that thinks with you",
    body: "Mnemo reads what you save, understands the meaning, connects related ideas automatically, and recalls exactly what you need in seconds.",
    color: "#22c55e",
    stat: "0.3s",
    statLabel: "to surface any memory with semantic AI search",
  },
];

export function Problem() {
  return (
    <Section id="problem">
      <SectionHeading
        eyebrow="Why Mnemo exists"
        eyebrowIcon={<Brain className="h-3.5 w-3.5" />}
        title={
          <>
            Your mind is for having ideas,
            <br className="hidden sm:block" /> not storing them
          </>
        }
        description="Human memory was never built for the modern flood of information. Here is how that breaks down — and how we fix it."
      />

      <div className="relative mt-16">
        {/* connecting line */}
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
        <div className="flex flex-col gap-6 lg:gap-10">
          {steps.map((step, i) => (
            <Reveal key={step.stage} delay={i * 0.05}>
              <div
                className={`relative flex flex-col gap-6 lg:flex-row lg:items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/2">
                  <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-mnemo-card/60 p-7 transition-colors hover:border-white/15">
                    <div
                      className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
                      style={{ backgroundColor: step.color }}
                    />
                    <div className="relative">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          color: step.color,
                          backgroundColor: `${step.color}1a`,
                        }}
                      >
                        <step.icon className="h-3.5 w-3.5" />
                        {step.stage}
                      </span>
                      <h3 className="mt-4 text-2xl font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-mnemo-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </div>

                {/* node */}
                <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-2 border-mnemo-bg lg:block"
                  style={{ backgroundColor: step.color }}
                />

                <div className="lg:w-1/2 lg:px-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-center lg:text-left"
                  >
                    <div
                      className="text-6xl font-bold tracking-tight sm:text-7xl"
                      style={{ color: step.color }}
                    >
                      {step.stat}
                    </div>
                    <p className="mt-2 text-sm text-mnemo-muted">
                      {step.statLabel}
                    </p>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
