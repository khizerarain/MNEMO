import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { AppShell, PageHeader } from "@/components/app/AppShell";
import { QuizRunner, type QuizCardData } from "@/components/app/QuizRunner";
import { GraduationCap, Plus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type Idea = { insight: string; question: string; answer: string };

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("quiz_cards")
    .select(
      `id, question, answer, easiness_factor, next_review_at, memory:memory_id ( id, title, ideas )`
    )
    .eq("user_id", user.id)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(20);

  const rows = (data || []) as unknown as Array<{
    id: string;
    question: string;
    answer: string;
    easiness_factor: number;
    memory: { id: string; title: string; ideas: Idea[] };
  }>;

  const cards: QuizCardData[] = rows.map((r) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    easiness_factor: r.easiness_factor,
    memory: r.memory,
  }));

  return (
    <AppShell userEmail={user.email}>
      {cards.length === 0 ? (
        <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
          <PageHeader title="Review & Quiz" description="Spaced repetition keeps your memories sharp." />
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-mnemo-card/40 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <GraduationCap className="h-6 w-6 text-mnemo-success" />
            </span>
            <div>
              <p className="text-base font-medium text-white">You&apos;re all caught up</p>
              <p className="mt-1 text-sm text-mnemo-muted">
                No cards due right now. Capture something new to keep learning.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/capture"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                <Plus className="h-4 w-4" /> New Memory
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/25"
              >
                <Sparkles className="h-4 w-4 text-mnemo-primary" /> See insights
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <QuizRunner cards={cards} />
      )}
    </AppShell>
  );
}
