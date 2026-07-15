"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";
import { Section, SectionHeading, Reveal } from "./primitives";

const faqs = [
  {
    q: "How does Mnemo's AI memory actually work?",
    a: "When you save a memory, Mnemo reads and understands its meaning using AI embeddings — not just keywords. It then compares it against everything you already know, links related ideas, and makes it instantly retrievable through natural-language search.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your memories are encrypted in transit and at rest. We never sell your data or train public models on it. On Team plans you also get SSO, SAML, and granular access controls.",
  },
  {
    q: "How is search different from a normal notes app?",
    a: "Traditional apps match exact words. Mnemo understands intent and meaning, so you can ask a fuzzy question in plain language and still surface the right memory in about 0.3 seconds — even if you don't remember the exact wording.",
  },
  {
    q: "Can I import my existing notes?",
    a: "Yes. You can import from Notion, Obsidian, Apple Notes, Markdown files, and more. Mnemo will read, tag, and connect everything automatically as it imports.",
  },
  {
    q: "What happens to my memories if I cancel?",
    a: "You always own your data. You can export everything at any time in open formats, and downgrading to Free keeps your most recent memories accessible.",
  },
  {
    q: "Do you offer a free plan?",
    a: "Yes — the Free plan is free forever and includes up to 500 memories with full semantic search. Upgrade to Pro whenever you're ready for unlimited memory and the full knowledge graph.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="FAQ"
        eyebrowIcon={<HelpCircle className="h-3.5 w-3.5" />}
        title="Questions, answered"
        description="Everything you need to know about Mnemo Brain. Can't find an answer? Reach out any time."
      />

      <div className="mx-auto mt-14 max-w-3xl space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={faq.q} delay={i * 0.05}>
              <div
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen
                    ? "border-white/15 bg-mnemo-card/70"
                    : "border-white/[0.08] bg-mnemo-card/40 hover:border-white/12"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-white">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      isOpen
                        ? "border-mnemo-primary/40 bg-mnemo-primary/15 text-mnemo-primary"
                        : "border-white/10 text-mnemo-muted"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                    >
                      <p className="px-6 pb-5 text-[15px] leading-relaxed text-mnemo-muted">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
