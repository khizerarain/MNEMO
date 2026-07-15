"use client";

import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import type { SVGProps } from "react";
import { AuroraBackground, MagneticButton, Reveal } from "./primitives";

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.16 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12 24 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Showcase", href: "#showcase" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

const socials = [
  { icon: GithubIcon, href: "https://github.com", label: "GitHub" },
  { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  { icon: LinkedinIcon, href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative">
      {/* CTA band */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <AuroraBackground />
        <div className="pointer-events-none absolute inset-0 bg-grid-mnemo mask-radial-faded opacity-40" />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-mnemo-muted">
            <Brain className="h-3.5 w-3.5 text-mnemo-primary" />
            Never lose a thought again
          </span>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Start building your{" "}
            <span className="text-gradient-mnemo">second brain</span> today
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-mnemo-muted">
            Join 10,000+ thinkers who capture, connect, and recall everything
            that matters. Free forever to start.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/signup">
              <MagneticButton className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-black shadow-[0_0_40px_-8px_rgba(255,255,255,0.5)]">
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
            </Link>
            <Link href="/auth/login">
              <MagneticButton
                strength={0.2}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-7 py-3.5 text-base font-semibold text-white hover:border-white/25 hover:bg-white/[0.06]"
              >
                Log in
              </MagneticButton>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer links */}
      <div className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-6">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mnemo-primary to-[#4f2bb8]">
                  <Brain className="h-5 w-5 text-white" />
                </span>
                <span className="text-[17px] font-semibold tracking-tight text-white">
                  Mnemo<span className="text-mnemo-muted">Brain</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-mnemo-muted">
                Your second brain, powered by AI. Capture ideas, organize
                knowledge, and retrieve information instantly.
              </p>
              <div className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-mnemo-muted transition-colors hover:border-white/25 hover:text-white"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white">{col.title}</h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-mnemo-muted transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-xs text-mnemo-muted">
              © {new Date().getFullYear()} Mnemo Brain. All rights reserved.
            </p>
            <p className="text-xs text-mnemo-muted">
              Crafted for people who never want to forget.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
