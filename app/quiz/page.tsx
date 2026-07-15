import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/Navbar";
import { QuizCard } from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";

interface MemoryIdea {
  insight: string;
  question: string;
  answer: string;
}

/**
 * Data shape expected by the QuizCard component.
 * Supabase stores question/answer/repetitions/easiness_factor directly,
 * so we map those columns into a friendlier client shape. We also fetch the
 * parent memory's ideas so the component can build multiple-choice distractors.
 */
interface QuizCardData {
  id: string;
  question: string;
  answer: string;
  memory: {
    id: string;
    title: string;
    ideas: MemoryIdea[];
  };
  repetitions: number;
  easiness_factor: number;
  interval_days: number;
}

export default async function QuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch cards that are due today or earlier. We join with memories to get the title and ideas.
  const { data, error } = await supabase
    .from("quiz_cards")
    .select(`
      id,
      question,
      answer,
      repetitions,
      easiness_factor,
      interval_days,
      next_review_at,
      memory:memory_id ( id, title, ideas )
    `)
    .eq("user_id", user.id)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Quiz fetch error:", error);
    redirect("/dashboard");
  }

  const rows = (data || []) as unknown as Array<{
    id: string;
    question: string;
    answer: string;
    repetitions: number;
    easiness_factor: number;
    interval_days: number;
    memory: { id: string; title: string; ideas: MemoryIdea[] };
  }>;

  const cards: QuizCardData[] = rows.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    memory: row.memory,
    repetitions: row.repetitions,
    easiness_factor: row.easiness_factor,
    interval_days: row.interval_days,
  }));

  return (
    <div className="min-h-screen bg-mnemo-background text-mnemo-text">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold mb-1">Daily quiz</h1>
          <p className="text-mnemo-muted">Review what you&apos;ve learned. Spaced repetition helps you remember.</p>
        </div>

        {cards.length === 0 ? (
          <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
            <CardContent className="p-10 text-center">
              <GraduationCap className="w-10 h-10 text-mnemo-muted mx-auto mb-4" />
              <CardTitle className="font-display text-lg mb-1">All caught up</CardTitle>
              <CardDescription className="text-mnemo-muted mb-5">
                You have no cards due today. Capture something new to keep learning.
              </CardDescription>
              <Link href="/capture">
                <Button className="bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-full px-5">
                  <Plus className="w-4 h-4 mr-2" />
                  Add memory
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-mnemo-muted">
              <span>{cards.length} card{cards.length === 1 ? "" : "s"} due today</span>
              <span>Card {1} of {cards.length}</span>
            </div>
            <QuizCard cards={cards} />
          </>
        )}
      </main>
    </div>
  );
}
