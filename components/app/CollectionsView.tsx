"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderKanban,
  Plus,
  X,
  Trash2,
  Search,
  FileText,
  Check,
  FolderPlus,
} from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { GlowCard } from "@/components/app/widgets";
import { colorForKey, hexToRgb, relativeTime } from "@/lib/knowledge";
import { cn } from "@/lib/utils";

type MemoryLite = { id: string; title: string; topic: string; created_at: string };
type Collection = { id: string; name: string; color: string; memoryIds: string[] };

const STORAGE_KEY = "mnemo:collections";
const PRESET_COLORS = ["#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"];

export function CollectionsView({ memories }: { memories: MemoryLite[] }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ready, setReady] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [manageId, setManageId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollections(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = (next: Collection[]) => {
    setCollections(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const create = () => {
    if (!newName.trim()) return;
    persist([
      ...collections,
      { id: crypto.randomUUID(), name: newName.trim(), color: newColor, memoryIds: [] },
    ]);
    setNewName("");
    setNewColor(PRESET_COLORS[0]);
    setCreating(false);
  };

  const remove = (id: string) => persist(collections.filter((c) => c.id !== id));

  const toggleMemory = (colId: string, memId: string) => {
    persist(
      collections.map((c) =>
        c.id === colId
          ? {
              ...c,
              memoryIds: c.memoryIds.includes(memId)
                ? c.memoryIds.filter((m) => m !== memId)
                : [...c.memoryIds, memId],
            }
          : c
      )
    );
  };

  const memoryById = useMemo(
    () => new Map(memories.map((m) => [m.id, m])),
    [memories]
  );
  const manage = collections.find((c) => c.id === manageId) || null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        title="Collections"
        description="Group related memories into focused folders, like Football, Programming, or Business."
        actions={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.5)]"
          >
            <Plus className="h-4 w-4" /> New Collection
          </button>
        }
      />

      {ready && collections.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-mnemo-card/40 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <FolderKanban className="h-6 w-6 text-mnemo-muted" />
          </span>
          <div>
            <p className="text-base font-medium text-white">No collections yet</p>
            <p className="mt-1 text-sm text-mnemo-muted">
              Create your first collection to organize memories your way.
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            <FolderPlus className="h-4 w-4" /> Create collection
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const previews = c.memoryIds
              .map((id) => memoryById.get(id))
              .filter(Boolean)
              .slice(0, 3) as MemoryLite[];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlowCard glow={hexToRgb(c.color)} className="p-5">
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${c.color}1f`, color: c.color }}
                    >
                      <FolderKanban className="h-5 w-5" />
                    </span>
                    <button
                      onClick={() => remove(c.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-mnemo-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                      aria-label="Delete collection"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="mt-3.5 text-base font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-mnemo-muted">
                    {c.memoryIds.length} {c.memoryIds.length === 1 ? "memory" : "memories"}
                  </p>
                  <div className="mt-4 space-y-1.5">
                    {previews.length === 0 && (
                      <p className="text-xs text-mnemo-muted/70">Empty — add memories</p>
                    )}
                    {previews.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-xs text-white/80"
                      >
                        <FileText className="h-3 w-3 shrink-0 text-mnemo-muted" />
                        <span className="truncate">{m.title}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setManageId(c.id)}
                    className="mt-4 w-full rounded-lg border border-white/10 py-2 text-xs font-medium text-white transition-colors hover:border-white/25"
                  >
                    Manage memories
                  </button>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <Modal onClose={() => setCreating(false)}>
            <h3 className="text-lg font-semibold text-white">New collection</h3>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="Collection name"
              className="mt-4 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-white placeholder:text-mnemo-muted focus:border-mnemo-primary focus:outline-none"
            />
            <div className="mt-4 flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform",
                    newColor === c && "ring-2 ring-white ring-offset-2 ring-offset-[#0b0b0b]"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCreating(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={!newName.trim()}
                className="flex-1 rounded-xl bg-white py-2.5 text-sm font-semibold text-black disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Manage drawer */}
      <AnimatePresence>
        {manage && (
          <ManageDrawer
            collection={manage}
            memories={memories}
            onClose={() => setManageId(null)}
            onToggle={(memId) => toggleMemory(manage.id, memId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0b0b] p-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ManageDrawer({
  collection,
  memories,
  onClose,
  onToggle,
}: {
  collection: Collection;
  memories: MemoryLite[];
  onClose: () => void;
  onToggle: (memId: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = memories.filter((m) =>
    m.title.toLowerCase().includes(q.trim().toLowerCase())
  );
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
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${collection.color}1f`, color: collection.color }}
            >
              <FolderKanban className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">{collection.name}</h2>
              <p className="text-xs text-mnemo-muted">{collection.memoryIds.length} added</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-mnemo-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-white/[0.06] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
            <Search className="h-4 w-4 text-mnemo-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search memories to add..."
              className="w-full bg-transparent text-sm text-white placeholder:text-mnemo-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-mnemo-muted">No memories found.</p>
          )}
          {filtered.map((m) => {
            const added = collection.memoryIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => onToggle(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  added
                    ? "border-mnemo-primary/30 bg-mnemo-primary/[0.08]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                )}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${colorForKey(m.topic)}1f`,
                    color: colorForKey(m.topic),
                  }}
                >
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{m.title}</p>
                  <p className="text-xs text-mnemo-muted">
                    {m.topic} · {relativeTime(m.created_at)}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    added
                      ? "border-mnemo-primary bg-mnemo-primary text-white"
                      : "border-white/15 text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
}
