"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-500 sm:px-5",
          scrolled
            ? "border-white/10 bg-black/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8] shadow-glow-primary">
            <Brain className="h-5 w-5 text-white" strokeWidth={2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-white">
            Mnemo<span className="text-mnemo-muted">Brain</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3.5 py-2 text-sm font-medium text-mnemo-muted transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-mnemo-primary to-mnemo-accent transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-mnemo-muted transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.5)]"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[72px] z-40 bg-black/80 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="mx-4 mt-4 flex flex-col gap-1 rounded-2xl border border-white/10 bg-mnemo-card/80 p-4"
            >
              {links.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-lg px-4 py-3 text-base font-medium text-mnemo-muted transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-4 py-3 text-center text-base font-medium text-white transition-colors hover:bg-white/5"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-white px-4 py-3 text-center text-base font-semibold text-black"
                >
                  Start Free
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
