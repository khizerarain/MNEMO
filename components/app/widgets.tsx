"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  GlowCard — pointer-tracked bordered panel                                 */
/* -------------------------------------------------------------------------- */

export function GlowCard({
  children,
  className,
  glow = "124, 58, 237",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  hover?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const background = useTransform(
    [mx, my],
    ([x, y]) =>
      `radial-gradient(400px circle at ${x}px ${y}px, rgba(${glow}, 0.1), transparent 70%)`
  );

  function move(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  return (
    <div
      ref={ref}
      onMouseMove={hover ? move : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-mnemo-card/60",
        className
      )}
    >
      {hover && (
        <motion.div
          aria-hidden
          style={{ background }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ProgressRing                                                              */
/* -------------------------------------------------------------------------- */

export function ProgressRing({
  progress,
  size = 64,
  stroke = 6,
  color = "#7c3aed",
  track = "rgba(255,255,255,0.08)",
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(progress, 0), 1) * c);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ContributionHeatmap — GitHub-style activity grid                          */
/* -------------------------------------------------------------------------- */

export function ContributionHeatmap({
  counts,
  weeks = 26,
  color = "124, 58, 237",
}: {
  counts: Record<string, number>; // key = YYYY-MM-DD
  weeks?: number;
  color?: string;
}) {
  const days: { date: Date; key: string; count: number }[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (weeks * 7 - 1));
  // align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const cursor = new Date(start);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: new Date(cursor), key, count: counts[key] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const max = Math.max(1, ...days.map((d) => d.count));
  const level = (n: number) => {
    if (n === 0) return 0;
    const ratio = n / max;
    if (ratio > 0.66) return 4;
    if (ratio > 0.33) return 3;
    if (ratio > 0.1) return 2;
    return 1;
  };
  const opacity = [0.04, 0.25, 0.45, 0.7, 1];

  const columns: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  const monthLabels: { col: number; label: string }[] = [];
  columns.forEach((col, i) => {
    const first = col[0];
    if (!first) return;
    if (first.date.getDate() <= 7) {
      monthLabels.push({
        col: i,
        label: first.date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-1 pl-0 text-[10px] text-mnemo-muted">
          {columns.map((_, i) => {
            const m = monthLabels.find((x) => x.col === i);
            return (
              <span key={i} className="w-3 shrink-0">
                {m ? m.label : ""}
              </span>
            );
          })}
        </div>
        <div className="flex gap-1">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((d) => (
                <motion.div
                  key={d.key}
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.006 }}
                  title={`${d.count} on ${d.key}`}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      d.count === 0
                        ? "rgba(255,255,255,0.04)"
                        : `rgba(${color}, ${opacity[level(d.count)]})`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sparkline / bar chart                                                     */
/* -------------------------------------------------------------------------- */

export function BarChart({
  data,
  color = "#7c3aed",
  height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full rounded-t-md"
              style={{
                background: `linear-gradient(to top, ${color}, ${color}55)`,
                minHeight: d.value > 0 ? 4 : 0,
              }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <span className="text-[10px] text-mnemo-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
