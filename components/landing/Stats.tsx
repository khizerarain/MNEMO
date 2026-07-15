"use client";

import { Reveal, AnimatedCounter } from "./primitives";

const stats = [
  { value: 50000, suffix: "+", label: "Memories stored", decimals: 0 },
  { value: 10000, suffix: "+", label: "Active users", decimals: 0 },
  { value: 1, suffix: "M+", label: "Searches run", decimals: 0 },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: 1 },
];

export function Stats() {
  return (
    <section className="relative border-y border-white/[0.06] px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-dot-mnemo opacity-40 mask-radial-faded" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-mnemo-muted">
            Trusted by curious minds at fast-moving teams
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals}
                />
              </div>
              <p className="mt-2 text-sm text-mnemo-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
