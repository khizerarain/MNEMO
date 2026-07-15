"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Plus,
  Search,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Network,
  GraduationCap,
  FolderKanban,
  BarChart3,
  Sparkles,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { OPEN_COMMAND_EVENT } from "./CommandPalette";
import { cn } from "@/lib/utils";

const nav = [
  { section: "Workspace", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/memories", label: "Memories", icon: BookOpen },
    { href: "/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/graph", label: "Knowledge Graph", icon: Network },
    { href: "/quiz", label: "Review & Quiz", icon: GraduationCap },
  ]},
  { section: "Organize", items: [
    { href: "/collections", label: "Collections", icon: FolderKanban },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/insights", label: "AI Insights", icon: Sparkles },
  ]},
];

export function Sidebar({
  collapsed,
  onToggle,
  userEmail,
}: {
  collapsed: boolean;
  onToggle: () => void;
  userEmail?: string;
}) {
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const openCommand = () =>
    window.dispatchEvent(new CustomEvent(OPEN_COMMAND_EVENT));

  return (
    <div
      className="flex h-full flex-col border-r border-white/[0.06] bg-[#0a0a0a]"
      style={{ width: collapsed ? 72 : 264 }}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8] shadow-glow-primary">
            <Brain className="h-5 w-5 text-white" />
          </span>
          {!collapsed && (
            <span className="whitespace-nowrap text-[16px] font-semibold tracking-tight text-white">
              Mnemo<span className="text-mnemo-muted">Brain</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-mnemo-muted transition-colors hover:bg-white/5 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3">
        {/* New Memory */}
        <Link
          href="/capture"
          className={cn(
            "group flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          {!collapsed && "New Memory"}
        </Link>

        {/* Search */}
        <button
          onClick={openCommand}
          className={cn(
            "mt-2 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-sm text-mnemo-muted transition-colors hover:border-white/12 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <Search className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search</span>
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {nav.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-mnemo-muted/60">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-white"
                        : "text-mnemo-muted hover:text-white",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg border border-white/[0.08] bg-white/[0.05]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "relative z-10 h-4 w-4 shrink-0",
                        active && "text-mnemo-primary"
                      )}
                    />
                    {!collapsed && (
                      <span className="relative z-10 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onToggle}
              aria-label="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-mnemo-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-mnemo-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mnemo-primary/40 to-mnemo-accent/40 text-xs font-semibold text-white">
              {(userEmail?.[0] || "M").toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {userEmail || "Your account"}
              </p>
              <Link href="/settings" className="text-[11px] text-mnemo-muted hover:text-white">
                Settings
              </Link>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-mnemo-muted transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
