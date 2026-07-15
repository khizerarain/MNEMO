"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Eye } from "lucide-react";

interface QuizCardData {
  id: string;
  question: string;
  answer: string;
  memory: {
    id: string;
    title: string;
  };
}

interface QuizCardProps {
  cards: QuizCardData[];
}

/**
 * Map the four user-friendly difficulty buttons to SM-2 quality ratings.
 * SM-2 expects 0-5, where 0 = complete blackout and 5 = perfect recall.
 */
const RATING_MAP: Record<string, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function QuizCard({ cards }: QuizCardProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  /**
   * Submit the user's self-assessment to the SM-2 API.
   * The API expects a quality score (0-5), not the button label.
   */
  async function submitRating(ratingKey: keyof typeof RATING_MAP) {
    if (!currentCard) return;
    setLoading(true);
    setError(null);

    const quality = RATING_MAP[ratingKey];

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard.id, quality }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update quiz progress");

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
        setRevealed(false);
      } else {
        setCompleted(true);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
        <CardContent className="p-10 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <CardTitle className="font-display text-xl mb-2">Session complete</CardTitle>
          <CardDescription className="text-mnemo-muted mb-5">
            Great work. Come back tomorrow for more review.
          </CardDescription>
          <Button onClick={() => router.refresh()} variant="outline" className="border-mnemo-border rounded-full px-5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Check again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-1.5" />

      <Card className="border-mnemo-border bg-mnemo-surface shadow-none">
        <CardHeader className="pb-3">
          <CardDescription className="text-xs uppercase tracking-wider text-mnemo-muted">
            From {currentCard.memory.title}
          </CardDescription>
          <CardTitle className="font-display text-lg font-medium leading-snug">
            {currentCard.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!revealed ? (
            <Button
              onClick={() => setRevealed(true)}
              variant="outline"
              className="w-full border-mnemo-border text-mnemo-text hover:bg-mnemo-background rounded-lg h-11"
            >
              <Eye className="w-4 h-4 mr-2" />
              Show answer
            </Button>
          ) : (
            <div className="p-4 rounded-lg bg-mnemo-background border border-mnemo-border">
              <p className="text-sm font-medium text-mnemo-text mb-1">Answer:</p>
              <p className="text-sm text-mnemo-muted">{currentCard.answer}</p>
            </div>
          )}

          {revealed && (
            <div className="space-y-2">
              <p className="text-xs text-mnemo-muted text-center">How well did you know this?</p>
              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  disabled={loading}
                  onClick={() => submitRating("again")}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 rounded-lg h-11"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Again
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => submitRating("hard")}
                  variant="outline"
                  className="border-mnemo-border text-mnemo-muted hover:bg-mnemo-background rounded-lg h-11"
                >
                  Hard
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => submitRating("good")}
                  variant="outline"
                  className="border-mnemo-border text-mnemo-text hover:bg-mnemo-background rounded-lg h-11"
                >
                  Good
                </Button>
                <Button
                  disabled={loading}
                  onClick={() => submitRating("easy")}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg h-11"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Easy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
