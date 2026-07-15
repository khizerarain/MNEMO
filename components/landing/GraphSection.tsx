"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Network, Sparkles } from "lucide-react";
import { Section, SectionHeading, Reveal } from "./primitives";

type Node = {
  id: number;
  x: number;
  y: number;
  r: number;
  label: string;
  color: string;
};

const nodes: Node[] = [
  { id: 0, x: 50, y: 50, r: 26, label: "Second Brain", color: "#7c3aed" },
  { id: 1, x: 20, y: 22, r: 16, label: "AI & ML", color: "#06b6d4" },
  { id: 2, x: 82, y: 26, r: 15, label: "Startups", color: "#22c55e" },
  { id: 3, x: 84, y: 74, r: 14, label: "Design", color: "#f59e0b" },
  { id: 4, x: 18, y: 78, r: 15, label: "Research", color: "#ec4899" },
  { id: 5, x: 50, y: 12, r: 11, label: "Attention", color: "#06b6d4" },
  { id: 6, x: 92, y: 50, r: 10, label: "Naval", color: "#22c55e" },
  { id: 7, x: 50, y: 90, r: 11, label: "Systems", color: "#f59e0b" },
  { id: 8, x: 8, y: 50, r: 10, label: "Papers", color: "#ec4899" },
];

const edges: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
  [4, 8],
  [1, 8],
  [2, 5],
  [3, 6],
  [4, 7],
];

export function GraphSection() {
  const [active, setActive] = useState<number | null>(0);

  const isConnected = (id: number) =>
    active === null ||
    active === id ||
    edges.some(
      ([a, b]) => (a === active && b === id) || (b === active && a === id)
    );

  return (
    <Section id="graph" className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Knowledge Graph"
            eyebrowIcon={<Network className="h-3.5 w-3.5" />}
            title="Your ideas, beautifully connected"
            description="Every memory becomes a node. Every relationship becomes a link. Mnemo builds a living map of your mind so you can see how everything connects — and discover ideas you forgot you had."
          />
          <div className="mt-8 space-y-4">
            {[
              {
                icon: Sparkles,
                title: "Automatic connections",
                body: "AI links related concepts the moment you save them.",
              },
              {
                icon: Network,
                title: "Explore visually",
                body: "Click any node to trace how ideas branch and cluster.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-mnemo-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-mnemo-muted">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="relative aspect-square w-full">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_65%)] blur-2xl" />
            <svg viewBox="0 0 100 100" className="relative h-full w-full">
              {edges.map(([a, b], i) => {
                const on = isConnected(a) && isConnected(b);
                return (
                  <motion.line
                    key={i}
                    x1={nodes[a].x}
                    y1={nodes[a].y}
                    x2={nodes[b].x}
                    y2={nodes[b].y}
                    stroke={on ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={0.4}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.06 }}
                  />
                );
              })}
              {nodes.map((n) => {
                const on = isConnected(n.id);
                return (
                  <g
                    key={n.id}
                    onMouseEnter={() => setActive(n.id)}
                    className="cursor-pointer"
                    style={{ opacity: on ? 1 : 0.3, transition: "opacity 0.3s" }}
                  >
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r / 3.2}
                      fill={n.color}
                      fillOpacity={0.16}
                      animate={{ r: [n.r / 3.2, n.r / 2.6, n.r / 3.2] }}
                      transition={{
                        duration: 3 + n.id * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.circle
                      cx={n.x}
                      cy={n.y}
                      r={n.r / 5}
                      fill={n.color}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", delay: n.id * 0.08 }}
                      style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                      whileHover={{ scale: 1.3 }}
                    />
                    <text
                      x={n.x}
                      y={n.y + n.r / 5 + 3.5}
                      textAnchor="middle"
                      fontSize={n.id === 0 ? 3.4 : 2.6}
                      fill="white"
                      fillOpacity={on ? 0.9 : 0.4}
                      className="pointer-events-none font-medium"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
