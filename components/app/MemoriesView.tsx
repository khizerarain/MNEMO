"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  List,
  GalleryVerticalEnd,
  Search,
  Plus,
  FileText,
  Link2,
  ExternalLink,
  X,
  Star,
  Calendar,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { GlowCard } from "@/components/app/widgets";
import { relativeTime, colorForKey, hexToRgb } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

export type MemoryItem = {
  id: string;
  title: string;
  topic: string;
  created_at: string;
  snippet: string;
  ideas: { insight: string; question: string; answer: string }[];
  source_url: string | null;
  connectionCount: number;
  importance: number;
  connections: { id: string; title: string; explanation: string; score: number }[];
};

type View = "grid" | "list" | "timeline";
type DateFilter = "all" | "today" | "week" | "month";
type Sort = "recent" | "importance" | "connected";

export function MemoriesView({ memories }: { memories: MemoryItem[] }) {
  const params = useSearchParams();
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const open = params.get("open");
    if (open) setOpenId(open);
  }, [params]);

  const topics = useMemo(
    () => Array.from(new Set(memories.map((m) => m.topic))).sort(),
    [memories]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = query.trim().toLowerCase();
    let list = memories.filter((m) => {
      if (topic !== "all" && m.topic !== topic) return false;
      if (q && !(`${m.title} ${m.snippet}`.toLowerCase().includes(q))) return false;
      if (dateFilter !== "all") {
        const age = now - new Date(m.created_at).getTime();
        const day = 86400000;
        if (dateFilter === "today" && age > day) return false;
        if (dateFilter === "week" && age > 7 * day) return false;
        if (dateFilter === "month" && age > 30 * day) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "recent")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "importance") return b.importance - a.importance;
      return b.connectionCount - a.connectionCount;
    });
    return list;
  }, [memories, topic, query, dateFilter, sort]);

  const openMemory = memories.find((m) => m.id === openId) || null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        title="Memories"
        description={`${memories.length} ${memories.length === 1 ? "memory" : "memories"} in your second brain`}
        actions={
          <Link
            href="/capture"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]"
          >
            <Plus className="h-4 w-4" /> New Memory
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5">
          <Search className="h-4 w-4 text-mnemo-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-transparent text-sm text-white placeholder:text-mnemo-muted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <FilterSelect
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            value={topic}
            onChange={setTopic}
            options={[{ value: "all", label: "All topics" }, ...topics.map((t) => ({ value: t, label: t }))]}
          />
          <FilterSelect
            icon={<Calendar className="h-3.5 w-3.5" />}
            value={dateFilter}
            onChange={(v) => setDateFilter(v as DateFilter)}
            options={[
              { value: "all", label: "Any time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This week" },
              { value: "month", label: "This month" },
            ]}
          />
          <FilterSelect
            icon={<Star className="h-3.5 w-3.5" />}
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={[
              { value: "recent", label: "Recent" },
              { value: "importance", label: "Importance" },
              { value: "connected", label: "Most connected" },
            ]}
          />

          <div className="flex items-center rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5">
            {([
              { v: "grid", icon: LayoutGrid },
              { v: "list", icon: List },
              { v: "timeline", icon: GalleryVerticalEnd },
            ] as const).map((o) => (
              <button
                key={o.v}
                onClick={() => setView(o.v)}
                aria-label={o.v}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  view === o.v ? "bg-white/[0.08] text-white" : "text-mnemo-muted hover:text-white"
                )}
              >
                <o.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState hasMemories={memories.length > 0} />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <MemoryGridCard key={m.id} memory={m} index={i} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((m, i) => (
            <MemoryListRow key={m.id} memory={m} index={i} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      ) : (
        <Timeline memories={filtered} onOpen={setOpenId} />
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {openMemory && (
          <MemoryDrawer memory={openMemory} onClose={() => setOpenId(null)} onOpen={setOpenId} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
}) {
  return (
    <div className="relative hidden items-center sm:flex">
      <span className="pointer-events-none absolute left-2.5 text-mnemo-muted">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-lg border border-white/[0.07] bg-white/[0.02] py-2 pl-8 pr-7 text-sm text-white focus:outline-none focus:ring-1 focus:ring-mnemo-primary [&>option]:bg-[#111]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MemoryGridCard({
  memory,
  index,
  onOpen,
}: {
  memory: MemoryItem;
  index: number;
  onOpen: () => void;
}) {
  const color = colorForKey(memory.topic);
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.03 }}
      onClick={onOpen}
      className="text-left"
    >
      <GlowCard glow={hexToRgb(color)} className="h-full p-5 transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            <FileText className="h-4 w-4" />
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ color, backgroundColor: `${color}14` }}
          >
            {memory.topic}
          </span>
        </div>
        <h3 className="mt-3.5 line-clamp-2 text-[15px] font-semibold leading-snug text-white">
          {memory.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-mnemo-muted">
          {memory.snippet}
        </p>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-mnemo-muted">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {memory.ideas.length}
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="h-3 w-3" /> {memory.connectionCount}
          </span>
          <span className="ml-auto">{relativeTime(memory.created_at)}</span>
        </div>
      </GlowCard>
    </motion.button>
  );
}

function MemoryListRow({
  memory,
  index,
  onOpen,
}: {
  memory: MemoryItem;
  index: number;
  onOpen: () => void;
}) {
  const color = colorForKey(memory.topic);
  return (
    <motion.button
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 16) * 0.02 }}
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-xl border border-white/[0.06] bg-mnemo-card/50 p-3.5 text-left transition-colors hover:border-white/12 hover:bg-white/[0.03]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <FileText className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{memory.title}</p>
        <p className="truncate text-xs text-mnemo-muted">{memory.snippet}</p>
      </div>
      <span
        className="hidden rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline"
        style={{ color, backgroundColor: `${color}14` }}
      >
        {memory.topic}
      </span>
      <div className="hidden items-center gap-3 text-[11px] text-mnemo-muted md:flex">
        <span className="flex items-center gap-1">
          <Link2 className="h-3 w-3" /> {memory.connectionCount}
        </span>
        <span>{relativeTime(memory.created_at)}</span>
      </div>
    </motion.button>
  );
}

function Timeline({
  memories,
  onOpen,
}: {
  memories: MemoryItem[];
  onOpen: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, MemoryItem[]>();
    for (const m of memories) {
      const key = new Date(m.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [memories]);

  return (
    <div className="relative space-y-8 pl-4 before:absolute before:left-[5px] before:top-2 before:h-full before:w-px before:bg-white/[0.08]">
      {groups.map(([date, items]) => (
        <div key={date} className="relative">
          <div className="mb-3 flex items-center gap-3">
            <span className="absolute -left-4 top-1 h-2.5 w-2.5 rounded-full bg-mnemo-primary ring-4 ring-mnemo-primary/15" />
            <span className="text-xs font-semibold uppercase tracking-wider text-mnemo-muted">
              {date}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((m, i) => (
              <MemoryListRow key={m.id} memory={m} index={i} onOpen={() => onOpen(m.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemoryDrawer({
  memory,
  onClose,
  onOpen,
}: {
  memory: MemoryItem;
  onClose: () => void;
  onOpen: (id: string) => void;
}) {
  const color = colorForKey(memory.topic);
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0b0b0b]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-5">
          <div className="min-w-0">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{ color, backgroundColor: `${color}16` }}
            >
              <FileText className="h-3 w-3" /> {memory.topic}
            </span>
            <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
              {memory.title}
            </h2>
            <p className="mt-1 text-xs text-mnemo-muted">
              {relativeTime(memory.created_at)} · {memory.ideas.length} ideas ·{" "}
              {memory.connectionCount} connections
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-mnemo-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {memory.source_url && (
            <a
              href={memory.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-mnemo-accent hover:underline"
            >
              View source <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-mnemo-muted">
              Key ideas
            </h3>
            <div className="space-y-2">
              {memory.ideas.map((idea, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                >
                  <p className="text-sm leading-relaxed text-white/90">{idea.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {memory.connections.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-mnemo-muted">
                Connected ideas
              </h3>
              <div className="space-y-2">
                {memory.connections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onOpen(c.id)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-left transition-colors hover:border-mnemo-accent/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-white">{c.title}</span>
                      <span className="shrink-0 rounded-full border border-mnemo-accent/30 px-2 py-0.5 text-[10px] text-mnemo-accent">
                        {Math.round(c.score * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-mnemo-muted">{c.explanation}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <Link
            href="/quiz"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
          >
            Review this in a quiz
          </Link>
        </div>
      </motion.aside>
    </>
  );
}

function EmptyState({ hasMemories }: { hasMemories: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-mnemo-card/40 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <BookOpen className="h-6 w-6 text-mnemo-muted" />
      </span>
      <div>
        <p className="text-base font-medium text-white">
          {hasMemories ? "No memories match your filters" : "No memories yet"}
        </p>
        <p className="mt-1 text-sm text-mnemo-muted">
          {hasMemories
            ? "Try adjusting your search or filters."
            : "Capture your first idea to start building your brain."}
        </p>
      </div>
      {!hasMemories && (
        <Link
          href="/capture"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          <Plus className="h-4 w-4" /> New Memory
        </Link>
      )}
    </div>
  );
}
