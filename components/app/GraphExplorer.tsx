/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Network,
  X,
  Sparkles,
  Link2,
  Brain,
  GraduationCap,
  Maximize2,
  Search,
  FileText,
} from "lucide-react";
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export type GraphNode = {
  id: string;
  title: string;
  topic: string;
  color: string;
  val: number;
  ideas: string[];
  connectionCount: number;
  retentionPct: number | null;
  cardCount: number;
  related: { id: string; title: string; explanation: string; score: number }[];
};

export type GraphLink = { source: string; target: string; similarity: number };

export function GraphExplorer({
  nodes,
  links,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // neighbor adjacency
  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    nodes.forEach((n) => map.set(n.id, new Set()));
    links.forEach((l) => {
      const s = typeof l.source === "string" ? l.source : (l.source as any).id;
      const t = typeof l.target === "string" ? l.target : (l.target as any).id;
      map.get(s)?.add(t);
      map.get(t)?.add(s);
    });
    return map;
  }, [nodes, links]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    }),
    [nodes, links]
  );

  const activeId = hovered || selected?.id || null;

  const isHighlighted = useCallback(
    (id: string) => {
      if (!activeId) return true;
      if (id === activeId) return true;
      return neighbors.get(activeId)?.has(id) ?? false;
    },
    [activeId, neighbors]
  );

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, scale: number) => {
      const r = Math.max(3, node.val);
      const highlighted = isHighlighted(node.id);
      const alpha = highlighted ? 1 : 0.15;

      // glow
      if (highlighted) {
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
        grad.addColorStop(0, `${node.color}55`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      if (node.id === selected?.id) {
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      // label
      if (scale > 1.2 || highlighted) {
        const label = node.title.length > 22 ? node.title.slice(0, 22) + "…" : node.title;
        const fontSize = Math.max(3, 11 / scale);
        ctx.font = `${fontSize}px ui-sans-serif, system-ui`;
        ctx.fillStyle = highlighted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)";
        ctx.textAlign = "center";
        ctx.fillText(label, node.x, node.y + r + fontSize + 1);
      }
      ctx.globalAlpha = 1;
    },
    [isHighlighted, selected]
  );

  const focus = useCallback(
    (n: GraphNode) => {
      setSelected(n);
      const fg = fgRef.current;
      if (fg) {
        const node: any = graphData.nodes.find((x: any) => x.id === n.id);
        if (node && node.x != null) {
          fg.centerAt(node.x, node.y, 600);
          fg.zoom(2.4, 600);
        }
      }
    },
    [graphData]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 5);
  }, [query, nodes]);

  return (
    <div className="relative h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Header overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-5 sm:p-6">
        <div className="pointer-events-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Knowledge Graph</h1>
            <p className="mt-1 text-sm text-mnemo-muted">
              {nodes.length} nodes · {links.length} connections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 backdrop-blur-md">
                <Search className="h-4 w-4 text-mnemo-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a node..."
                  className="w-40 bg-transparent text-sm text-white placeholder:text-mnemo-muted focus:outline-none"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d]/95 backdrop-blur-md">
                  {searchResults.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        focus(n);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/85 hover:bg-white/5"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: n.color }} />
                      <span className="truncate">{n.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => fgRef.current?.zoomToFit(600, 60)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-black/50 text-white backdrop-blur-md transition-colors hover:border-white/25"
              aria-label="Fit graph"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} className="absolute inset-0">
        {nodes.length === 0 ? (
          <EmptyGraph />
        ) : (
          <ForceGraph2D
            ref={fgRef as any}
            width={dims.w}
            height={dims.h}
            graphData={graphData}
            backgroundColor="#050505"
            nodeRelSize={1}
            nodeVal={(n: any) => n.val}
            nodeCanvasObject={paintNode as any}
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(node.x, node.y, Math.max(4, node.val) + 3, 0, 2 * Math.PI);
              ctx.fill();
            }}
            linkColor={(l: any) => {
              const s = typeof l.source === "string" ? l.source : l.source.id;
              const t = typeof l.target === "string" ? l.target : l.target.id;
              const on = !activeId || s === activeId || t === activeId;
              return on ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.04)";
            }}
            linkWidth={(l: any) => 0.5 + (l.similarity || 0.5)}
            linkDirectionalParticles={(l: any) => {
              const s = typeof l.source === "string" ? l.source : l.source.id;
              const t = typeof l.target === "string" ? l.target : l.target.id;
              return activeId && (s === activeId || t === activeId) ? 3 : 0;
            }}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "#7c3aed"}
            onNodeClick={(n: any) => focus(nodeById.get(n.id)!)}
            onNodeHover={(n: any) => setHovered(n ? n.id : null)}
            onBackgroundClick={() => setSelected(null)}
            cooldownTicks={120}
            onEngineStop={() => fgRef.current?.zoomToFit(500, 60)}
          />
        )}
      </div>

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="pointer-events-none absolute bottom-5 left-5 z-20 hidden text-[11px] text-mnemo-muted sm:block">
          Drag to move · scroll to zoom · click a node for details
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0b0b0b]/95 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-5">
              <div className="min-w-0">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ color: selected.color, backgroundColor: `${selected.color}16` }}
                >
                  <FileText className="h-3 w-3" /> {selected.topic}
                </span>
                <h2 className="mt-3 text-lg font-semibold leading-snug text-white">
                  {selected.title}
                </h2>
                <p className="mt-1 text-xs text-mnemo-muted">
                  {selected.connectionCount} connections · {selected.ideas.length} ideas
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-mnemo-muted hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Summary */}
              {selected.ideas.length > 0 && (
                <Panel icon={Brain} title="Summary" accent="#7c3aed">
                  <ul className="space-y-2">
                    {selected.ideas.slice(0, 4).map((idea, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-sm leading-relaxed text-white/85"
                      >
                        {idea}
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {/* Quiz performance */}
              <Panel icon={GraduationCap} title="Quiz performance" accent="#22c55e">
                {selected.cardCount > 0 && selected.retentionPct != null ? (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-mnemo-muted">Recall strength</span>
                      <span className="font-semibold text-white">{selected.retentionPct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-mnemo-success"
                        style={{ width: `${selected.retentionPct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-mnemo-muted">
                      {selected.cardCount} quiz card{selected.cardCount === 1 ? "" : "s"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-mnemo-muted">No quiz data yet.</p>
                )}
              </Panel>

              {/* Related ideas */}
              {selected.related.length > 0 && (
                <Panel icon={Link2} title="Related ideas" accent="#06b6d4">
                  <div className="space-y-2">
                    {selected.related.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          const n = nodeById.get(r.id);
                          if (n) focus(n);
                        }}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-colors hover:border-mnemo-accent/30"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-white">{r.title}</span>
                          <span className="shrink-0 text-[10px] text-mnemo-accent">
                            {Math.round(r.score * 100)}%
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-mnemo-muted">{r.explanation}</p>
                      </button>
                    ))}
                  </div>
                </Panel>
              )}

              {/* AI insight */}
              <Panel icon={Sparkles} title="AI insight" accent="#ec4899">
                <p className="text-sm leading-relaxed text-mnemo-muted">
                  {aiInsight(selected)}
                </p>
              </Panel>
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <Link
                href={`/memories?open=${selected.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black"
              >
                Open memory
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function aiInsight(n: GraphNode): string {
  if (n.connectionCount === 0)
    return `This idea is currently isolated. Capturing related memories about ${n.topic} will help Mnemo weave it into your knowledge graph.`;
  if (n.connectionCount >= 4)
    return `This is a hub in your graph — it links to ${n.connectionCount} other ideas. Hub concepts are powerful anchors for recalling everything around them.`;
  if (n.retentionPct != null && n.retentionPct < 55)
    return `You're still consolidating ${n.topic}. A quick review will strengthen this node and its ${n.connectionCount} connections.`;
  return `Well connected to ${n.connectionCount} related ideas in ${n.topic}. Exploring these links reinforces long-term recall.`;
}

function Panel({
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
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-mnemo-muted">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function EmptyGraph() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <Network className="h-7 w-7 text-mnemo-muted" />
      </span>
      <div>
        <p className="text-base font-medium text-white">Your graph is empty</p>
        <p className="mt-1 text-sm text-mnemo-muted">
          Capture a few memories and watch your ideas connect.
        </p>
      </div>
      <Link
        href="/capture"
        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
      >
        Capture a memory
      </Link>
    </div>
  );
}
