"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Download,
  LogOut,
  Trash2,
  Shield,
  Palette,
  Check,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { GlowCard } from "@/components/app/widgets";
import { createClient } from "@/lib/supabase";

export function SettingsView({
  email,
  memberSince,
}: {
  email: string;
  memberSince: string;
}) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [clearedCollections, setClearedCollections] = useState(false);

  async function exportData() {
    setExporting(true);
    try {
      const supabase = createClient();
      const [{ data: memories }, { data: connections }] = await Promise.all([
        supabase.from("memories").select("*"),
        supabase.from("connections").select("*"),
      ]);
      const blob = new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), memories, connections }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mnemo-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } finally {
      setExporting(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function clearCollections() {
    localStorage.removeItem("mnemo:collections");
    setClearedCollections(true);
    setTimeout(() => setClearedCollections(false), 2500);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
      <PageHeader title="Settings" description="Manage your account and workspace." />

      <div className="space-y-4">
        {/* Account */}
        <Section icon={User} title="Account" accent="#7c3aed">
          <Row label="Email">
            <span className="text-sm text-white">{email}</span>
          </Row>
          <Row label="Member since">
            <span className="text-sm text-mnemo-muted">{memberSince}</span>
          </Row>
          <Row label="Plan">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mnemo-primary/15 px-2.5 py-1 text-xs font-medium text-mnemo-primary">
              Free
            </span>
          </Row>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" accent="#06b6d4">
          <Row label="Theme">
            <span className="text-sm text-mnemo-muted">Dark (premium) — always on</span>
          </Row>
          <Row label="Command palette">
            <span className="flex items-center gap-1 text-sm text-mnemo-muted">
              Press
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
              anywhere
            </span>
          </Row>
        </Section>

        {/* Data */}
        <Section icon={Shield} title="Data & privacy" accent="#22c55e">
          <Row label="Export your data">
            <button
              onClick={exportData}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/25"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : exported ? (
                <Check className="h-4 w-4 text-mnemo-success" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exported ? "Downloaded" : "Export JSON"}
            </button>
          </Row>
          <Row label="Clear local collections">
            <button
              onClick={clearCollections}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-red-500/40 hover:text-red-300"
            >
              {clearedCollections ? (
                <Check className="h-4 w-4 text-mnemo-success" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {clearedCollections ? "Cleared" : "Clear"}
            </button>
          </Row>
        </Section>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-mnemo-card/60 py-3.5 text-sm font-semibold text-white transition-colors hover:border-red-500/30 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <GlowCard glow="124, 58, 237" className="p-6" hover={false}>
        <div className="mb-4 flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="divide-y divide-white/[0.05]">{children}</div>
      </GlowCard>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-mnemo-muted">{label}</span>
      {children}
    </div>
  );
}
