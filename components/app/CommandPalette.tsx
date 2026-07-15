"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Network,
  GraduationCap,
  FolderKanban,
  BarChart3,
  Sparkles,
  Settings,
  CornerDownLeft,
  FileText,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { deriveTopic, colorForKey } from "@/lib/knowledge";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ElementType;
  run: () => void;
  group: string;
};

type MemoryHit = { id: string; title: string };

export const OPEN_COMMAND_EVENT = "mnemo:open-command";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [memories, setMemories] = useState<MemoryHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const actions: Action[] = useMemo(
    () => [
      { id: "new", label: "New Memory", hint: "Capture", icon: Plus, group: "Actions", run: () => go("/capture") },
      { id: "quiz", label: "Start Review & Quiz", icon: GraduationCap, group: "Actions", run: () => go("/quiz") },
      { id: "chat", label: "Open AI Chat", icon: MessageSquare, group: "Actions", run: () => go("/chat") },
      { id: "graph", label: "View Knowledge Graph", icon: Network, group: "Actions", run: () => go("/graph") },
      { id: "dash", label: "Dashboard", icon: LayoutDashboard, group: "Navigate", run: () => go("/dashboard") },
      { id: "mem", label: "Memories", icon: BookOpen, group: "Navigate", run: () => go("/memories") },
      { id: "col", label: "Collections", icon: FolderKanban, group: "Navigate", run: () => go("/collections") },
      { id: "ana", label: "Analytics", icon: BarChart3, group: "Navigate", run: () => go("/analytics") },
      { id: "ins", label: "AI Insights", icon: Sparkles, group: "Navigate", run: () => go("/insights") },
      { id: "set", label: "Settings", icon: Settings, group: "Navigate", run: () => go("/settings") },
    ],
    [go]
  );

  // Global hotkey + external open event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_EVENT, onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_EVENT, onOpen as EventListener);
    };
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  // Live memory search (debounced)
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setMemories([]);
      return;
    }
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("memories")
        .select("id, title")
        .ilike("title", `%${q}%`)
        .limit(6);
      setMemories((data as MemoryHit[]) || []);
    }, 180);
    return () => clearTimeout(t);
  }, [query, open]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  type Row =
    | { kind: "action"; action: Action }
    | { kind: "memory"; memory: MemoryHit };

  const rows: Row[] = useMemo(() => {
    const r: Row[] = filteredActions.map((action) => ({ kind: "action", action }));
    memories.forEach((memory) => r.push({ kind: "memory", memory }));
    return r;
  }, [filteredActions, memories]);

  useEffect(() => {
    setActive(0);
  }, [query, memories.length]);

  const runRow = useCallback(
    (row: Row) => {
      if (row.kind === "action") row.action.run();
      else go(`/memories?open=${row.memory.id}`);
    },
    [go]
  );

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (rows[active]) runRow(rows[active]);
    }
  };

  let rowIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-mnemo-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories or run a command…"
                className="w-full bg-transparent text-[15px] text-white placeholder:text-mnemo-muted focus:outline-none"
              />
              <kbd className="hidden items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-mnemo-muted sm:flex">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {rows.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-mnemo-muted">
                  No results for “{query}”
                </div>
              )}

              {filteredActions.length > 0 && (
                <Group label={query ? "Commands" : "Quick actions"} />
              )}
              {filteredActions.map((action) => {
                rowIndex++;
                const idx = rowIndex;
                return (
                  <Item
                    key={action.id}
                    active={active === idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={action.run}
                  >
                    <action.icon className="h-4 w-4 text-mnemo-muted" />
                    <span className="flex-1">{action.label}</span>
                    {action.hint && (
                      <span className="text-xs text-mnemo-muted">{action.hint}</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-mnemo-muted opacity-0 group-hover:opacity-100" />
                  </Item>
                );
              })}

              {memories.length > 0 && <Group label="Memories" />}
              {memories.map((memory) => {
                rowIndex++;
                const idx = rowIndex;
                const topic = deriveTopic(memory.title);
                return (
                  <Item
                    key={memory.id}
                    active={active === idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(`/memories?open=${memory.id}`)}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${colorForKey(topic)}22`, color: colorForKey(topic) }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 truncate">{memory.title}</span>
                    <CornerDownLeft className="h-3.5 w-3.5 text-mnemo-muted opacity-0 group-hover:opacity-100" />
                  </Item>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-mnemo-muted">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 px-1">↑</kbd>
                <kbd className="rounded border border-white/10 px-1">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 px-1">↵</kbd>
                to select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Group({ label }: { label: string }) {
  return (
    <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-mnemo-muted/70">
      {label}
    </div>
  );
}

function Item({
  children,
  active,
  onClick,
  onMouseEnter,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
        active ? "bg-white/[0.07] text-white" : "text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
