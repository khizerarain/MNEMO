/**
 * Pure, dependency-free helpers shared across the app workspace.
 * Safe to import from both server and client components.
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "at", "by", "from", "as", "is", "are", "was", "were", "be", "been", "how",
  "what", "why", "when", "where", "which", "that", "this", "these", "those",
  "your", "you", "my", "our", "it", "its", "about", "into", "over", "using",
  "use", "can", "will", "not", "no", "vs", "via", "per",
]);

const TOPIC_PALETTE = [
  "#7c3aed", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#ef4444", "#3b82f6", "#eab308",
];

/** Derive a short topic label from a memory title. */
export function deriveTopic(title: string): string {
  if (!title) return "General";
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()));
  if (words.length === 0) return title.split(/\s+/)[0] || "General";
  const w = words[0];
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Convert #rrggbb to "r, g, b". */
export function hexToRgb(hex: string): string {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return "124, 58, 237";
  return m.map((h) => parseInt(h, 16)).join(", ");
}

/** Deterministic color for any string key. */
export function colorForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return TOPIC_PALETTE[Math.abs(hash) % TOPIC_PALETTE.length];
}

/** Extract the top keyword topics across a set of texts. */
export function topKeywords(
  texts: string[],
  limit = 8
): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>();
  for (const text of texts) {
    const seen = new Set<string>();
    for (const raw of (text || "").replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/)) {
      const w = raw.toLowerCase();
      if (w.length < 4 || STOPWORDS.has(w)) continue;
      if (seen.has(w)) continue;
      seen.add(w);
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([word, count]) => ({
      word: word.charAt(0).toUpperCase() + word.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Human-friendly relative time, e.g. "3h ago". */
export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Clock time like "10:20". */
export function clockTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Compute the current daily streak from a list of activity dates. */
export function calculateStreak(dates: (string | Date)[]): number {
  if (dates.length === 0) return 0;
  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let expected = today;
  for (const day of uniqueDays) {
    if (day === expected || (streak === 0 && day === yesterday)) {
      streak++;
      expected = new Date(new Date(expected).getTime() - 86400000).toDateString();
    } else if (streak > 0) {
      break;
    }
  }
  return streak;
}
