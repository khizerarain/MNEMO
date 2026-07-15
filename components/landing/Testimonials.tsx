"use client";

import { Star, Quote } from "lucide-react";
import { Section, SectionHeading } from "./primitives";

type Review = {
  name: string;
  role: string;
  company: string;
  body: string;
  color: string;
};

const reviews: Review[] = [
  {
    name: "Aisha Khan",
    role: "Product Designer",
    company: "Vercel",
    body: "Mnemo turned my scattered bookmarks into a real second brain. I finally remember what I read — and find it in seconds.",
    color: "#7c3aed",
  },
  {
    name: "Daniel Rivera",
    role: "Staff Engineer",
    company: "Linear",
    body: "The automatic connections are uncanny. It surfaced links between papers I never would have noticed on my own.",
    color: "#06b6d4",
  },
  {
    name: "Maya Thompson",
    role: "PhD Researcher",
    company: "MIT",
    body: "Chatting with everything I've saved changed how I prepare for talks. It's like a research assistant that never sleeps.",
    color: "#22c55e",
  },
  {
    name: "James Lee",
    role: "Founder",
    company: "Ramp",
    body: "Clean, fast, and focused. Mnemo is the first knowledge tool my whole team actually keeps using.",
    color: "#f59e0b",
  },
  {
    name: "Sofia Martins",
    role: "Content Lead",
    company: "Notion",
    body: "The knowledge graph is genuinely beautiful — and useful. Seeing my ideas connect is weirdly motivating.",
    color: "#ec4899",
  },
  {
    name: "Noah Park",
    role: "Writer",
    company: "Independent",
    body: "I use it every single day. It's like having a personal librarian for my brain that instantly finds anything.",
    color: "#8b5cf6",
  },
];

export function Testimonials() {
  const columns = [
    [reviews[0], reviews[3]],
    [reviews[1], reviews[4]],
    [reviews[2], reviews[5]],
  ];
  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Loved by thinkers"
        eyebrowIcon={<Star className="h-3.5 w-3.5 fill-mnemo-accent text-mnemo-accent" />}
        title="Built for people who never want to forget"
        description="Join thousands of researchers, builders, and creators who upgraded their memory with Mnemo."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-4">
            {col.map((r, ri) => (
              <ReviewCard key={r.name} review={r} delay={(ci + ri) * 0.08} />
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function ReviewCard({ review, delay }: { review: Review; delay: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-mnemo-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30"
        style={{ backgroundColor: review.color }}
      />
      <Quote
        className="h-7 w-7 opacity-20"
        style={{ color: review.color }}
      />
      <div className="mt-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-mnemo-accent text-mnemo-accent"
          />
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-white/90">
        {review.body}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: `${review.color}33` }}
        >
          {review.name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{review.name}</p>
          <p className="text-xs text-mnemo-muted">
            {review.role} · {review.company}
          </p>
        </div>
      </div>
    </div>
  );
}
