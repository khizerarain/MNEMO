"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Brain } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { CommandPalette, OPEN_COMMAND_EVENT } from "./CommandPalette";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mnemo:sidebar-collapsed");
    if (stored) setCollapsed(stored === "1");
  }, []);

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem("mnemo:sidebar-collapsed", v ? "0" : "1");
      return !v;
    });
  };

  const openCommand = () =>
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT));

  return (
    <div className="app-root flex min-h-screen font-sans">
      <CommandPalette />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar collapsed={collapsed} onToggle={toggle} userEmail={userEmail} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <div className="relative h-full" onClick={() => setMobileOpen(false)}>
                <Sidebar collapsed={false} onToggle={toggle} userEmail={userEmail} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050505]/90 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]">
              <Brain className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-semibold text-white">Mnemo Brain</span>
          </Link>
          <button
            onClick={openCommand}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white"
          >
            <Search className="h-4 w-4" />
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

/* Optional page header used by pages */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-1.5 text-mnemo-muted"
          >
            {description}
          </motion.p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
