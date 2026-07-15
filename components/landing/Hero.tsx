"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import {
  AuroraBackground,
  MagneticButton,
  Particles,
  useMouseParallax,
  staggerContainer,
  fadeUp,
} from "./primitives";
import { DashboardPreview } from "./DashboardPreview";

export function Hero() {
  const parallax = useMouseParallax(16);

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:pb-32 sm:pt-44">
      {/* Backgrounds */}
      <AuroraBackground />
      <div className="pointer-events-none absolute inset-0 bg-grid-mnemo mask-radial-faded opacity-60" />
      <Particles quantity={60} className="opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.15),transparent)]" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="#features"
              className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 text-sm text-mnemo-muted backdrop-blur-sm transition-colors hover:border-white/20"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mnemo-primary/20 px-2.5 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3 w-3" />
                New
              </span>
              Introducing AI-powered memory recall
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Your Second Brain,
            <br />
            <span className="text-gradient-mnemo">Powered by AI</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-mnemo-muted sm:text-xl"
          >
            Capture ideas, organize knowledge, and retrieve information instantly
            with intelligent memory.{" "}
            <span className="text-white">Never lose a thought again.</span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/auth/signup">
              <MagneticButton className="group inline-flex h-[52px] items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-black shadow-[0_0_40px_-8px_rgba(255,255,255,0.5)] transition-shadow hover:shadow-[0_0_50px_-4px_rgba(255,255,255,0.7)]">
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
            </Link>
            <MagneticButton
              strength={0.2}
              className="inline-flex h-[52px] items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.06]"
            >
              <Play className="h-4 w-4 fill-white" />
              Watch Demo
            </MagneticButton>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center gap-3 text-sm text-mnemo-muted sm:flex-row sm:gap-6"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b"].map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border-2 border-mnemo-bg"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span>Loved by 10,000+ thinkers</span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-mnemo-accent text-mnemo-accent"
                  />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Product preview */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        style={{ perspective: 1200 }}
        className="relative mx-auto mt-20 max-w-5xl"
      >
        <motion.div style={{ x: parallax.x, y: parallax.y }}>
          <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.22),transparent_70%)] blur-2xl" />
          <DashboardPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}
