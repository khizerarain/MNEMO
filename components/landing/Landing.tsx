"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Stats } from "./Stats";
import { Problem } from "./Problem";
import { Features } from "./Features";
import { GraphSection } from "./GraphSection";
import { Screenshots } from "./Screenshots";
import { SearchDemo } from "./SearchDemo";
import { HowItWorks } from "./HowItWorks";
import { Testimonials } from "./Testimonials";
import { Comparison } from "./Comparison";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";

export function Landing() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="landing-root relative min-h-screen overflow-x-clip font-sans">
      <motion.div
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-mnemo-primary via-mnemo-accent to-mnemo-success"
      />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Problem />
        <Features />
        <GraphSection />
        <Screenshots />
        <SearchDemo />
        <HowItWorks />
        <Testimonials />
        <Comparison />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
