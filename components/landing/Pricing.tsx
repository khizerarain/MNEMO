"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Section, SectionHeading, Reveal, MagneticButton } from "./primitives";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For getting started with your second brain.",
    features: [
      "Up to 500 memories",
      "Semantic AI search",
      "Basic knowledge graph",
      "Auto-tagging",
      "Web capture",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious thinkers who never want to forget.",
    features: [
      "Unlimited memories",
      "Advanced AI retrieval",
      "Full interactive graph",
      "Chat with your brain",
      "Smart connections",
      "Priority support",
    ],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per user / month",
    description: "For teams building shared knowledge.",
    features: [
      "Everything in Pro",
      "Shared team memory",
      "Collaboration & roles",
      "Admin controls",
      "SSO & SAML",
      "Dedicated support",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        eyebrowIcon={<Sparkles className="h-3.5 w-3.5" />}
        title="Simple pricing that scales with you"
        description="Start free. Upgrade when your brain outgrows the basics. Cancel anytime."
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal key={plan.name} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-mnemo-primary/40 bg-gradient-to-b from-mnemo-primary/[0.1] to-mnemo-card/60 shadow-glow-primary"
                  : "border-white/[0.08] bg-mnemo-card/50 hover:border-white/15"
              }`}
            >
              {plan.highlighted && (
                <>
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-mnemo-primary/25 blur-3xl" />
                  <span className="absolute right-5 top-6 rounded-full bg-mnemo-primary px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                </>
              )}
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-mnemo-muted">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-mnemo-muted">/{plan.period}</span>
                </div>

                <Link href="/auth/signup" className="mt-6 block">
                  <MagneticButton
                    strength={0.15}
                    className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-white text-black hover:shadow-[0_0_30px_-6px_rgba(255,255,255,0.6)]"
                        : "border border-white/12 bg-white/[0.03] text-white hover:border-white/25 hover:bg-white/[0.06]"
                    }`}
                  >
                    {plan.cta}
                  </MagneticButton>
                </Link>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.highlighted
                            ? "bg-mnemo-primary/20 text-mnemo-primary"
                            : "bg-white/[0.06] text-mnemo-accent"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="text-white/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
