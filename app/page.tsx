import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import {
  Plus,
  Network,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Link2,
  ArrowRight,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: Plus,
      title: "Capture anything",
      description:
        "Paste an article, a note, or a lesson you learned. MNEMO reads it for you and extracts the most important ideas automatically.",
    },
    {
      icon: Link2,
      title: "Connect ideas",
      description:
        "Every new memory is compared to what you already know. MNEMO finds hidden relationships and explains why they matter.",
    },
    {
      icon: Network,
      title: "Visualize knowledge",
      description:
        "Explore your own interactive knowledge graph. Click through nodes to see how every concept links back to the rest of your brain.",
    },
    {
      icon: GraduationCap,
      title: "Remember forever",
      description:
        "Built-in spaced repetition quizzes surface the right ideas at the right time, so you retain what you learn long-term.",
    },
    {
      icon: MessageSquare,
      title: "Chat with your brain",
      description:
        "Ask questions in plain English and get answers grounded in your own saved memories. It is like a personal research assistant.",
    },
  ];

  const reviews = [
    {
      name: "Aisha K.",
      role: "Product Designer",
      body: "MNEMO turned my scattered bookmarks into a real second brain. I finally remember what I read.",
    },
    {
      name: "Daniel R.",
      role: "Software Engineer",
      body: "The automatic connections are surprisingly useful. I found links between papers I never would have noticed.",
    },
    {
      name: "Maya T.",
      role: "Student",
      body: "The quiz mode is my favorite. It feels like the app actually knows what I am about to forget.",
    },
    {
      name: "James L.",
      role: "Founder",
      body: "Clean, fast, and focused. MNEMO is the first knowledge tool that did not feel like work.",
    },
    {
      name: "Sofia M.",
      role: "Researcher",
      body: "Being able to chat with everything I have saved has completely changed how I prepare for talks.",
    },
    {
      name: "Noah P.",
      role: "Writer",
      body: "I use it every day. It is like having a personal librarian that never sleeps.",
    },
  ];

  const doubledReviews = [...reviews, ...reviews];

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text flex flex-col">
      <nav className="border-b border-mnemo-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            MNEMO
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-mnemo-muted hover:text-mnemo-text hover:bg-transparent"
              >
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-mnemo-primary hover:bg-mnemo-primary/90 text-primary-foreground rounded-full px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge
              variant="outline"
              className="mb-6 border-mnemo-accent/30 text-mnemo-accent px-3 py-1 rounded-full"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Your AI-powered second brain
            </Badge>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
              A second brain for everything you learn
            </h1>
            <p className="text-lg sm:text-xl text-mnemo-muted mb-10 leading-relaxed max-w-2xl mx-auto">
              Save ideas from anything you read. MNEMO extracts the core insights, finds hidden
              connections, and quizzes you so you never forget.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup">
                <Button className="bg-mnemo-primary hover:bg-mnemo-primary/90 text-primary-foreground rounded-full px-7 h-12 text-base">
                  Start building your brain
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-mnemo-border text-mnemo-text hover:bg-mnemo-surface rounded-full px-7 h-12"
                >
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16 border-t border-mnemo-border">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
                How MNEMO works
              </h2>
              <p className="text-mnemo-muted max-w-xl mx-auto">
                Five simple ideas that help you learn, connect, and remember more over time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="border-mnemo-border bg-mnemo-surface shadow-none hover:border-mnemo-accent/30 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-xl bg-mnemo-background border border-mnemo-border flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-mnemo-accent" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-mnemo-muted leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="px-6 py-16 border-t border-mnemo-border overflow-hidden">
          <div className="max-w-5xl mx-auto mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-3">
              Loved by curious minds
            </h2>
            <p className="text-mnemo-muted text-center max-w-xl mx-auto">
              See what people are saying about their second brain.
            </p>
          </div>

          <div className="relative w-full">
              <div className="flex gap-4 animate-marquee w-max hover:[animation-play-state:paused]">
              {doubledReviews.map((review, index) => (
                <Card
                  key={`${review.name}-${index}`}
                  className="w-[300px] sm:w-[340px] border-mnemo-border bg-mnemo-surface shadow-none flex-shrink-0"
                >
                  <CardContent className="p-5">
                    <p className="text-sm text-mnemo-text leading-relaxed mb-4">&ldquo;{review.body}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-mnemo-accent/10 flex items-center justify-center text-mnemo-accent font-semibold text-xs">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-mnemo-text">{review.name}</p>
                        <p className="text-xs text-mnemo-muted">{review.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-mnemo-border py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <Link href="/" className="font-display text-xl font-semibold tracking-tight">
                MNEMO
              </Link>
              <p className="text-sm text-mnemo-muted mt-1">
                Save, connect, and remember what matters.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-mnemo-muted hover:text-mnemo-text transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-mnemo-muted hover:text-mnemo-text transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.16 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56C20.72 21.38 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-mnemo-border text-center text-xs text-mnemo-muted">
            © {new Date().getFullYear()} MNEMO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
