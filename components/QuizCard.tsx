"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface MemoryIdea {
  insight: string;
  question: string;
  answer: string;
}

interface QuizCardData {
  id: string;
  question: string;
  answer: string;
  memory: {
    id: string;
    title: string;
    ideas: MemoryIdea[];
  };
}

interface QuizCardProps {
  cards: QuizCardData[];
}

/**
 * Build four multiple-choice options for a quiz card.
 * The correct answer is always included, and distractors are pulled from the
 * other ideas in the same memory. If the memory does not have enough other
 * ideas, generic fallback options are used to pad the list to four.
 */
function generateOptions(card: QuizCardData): { options: string[]; correctIndex: number } {
  const correctAnswer = card.answer.trim();

  const otherAnswers = card.memory.ideas
    .filter((idea) => idea.answer.trim() !== correctAnswer)
    .map((idea) => idea.answer.trim())
    .filter((value, index, self) => self.indexOf(value) === index);

  const fallbackOptions = [
    "None of the above",
    "All of the above",
    "It is not mentioned in the content",
  ];

  const distractors =
    otherAnswers.length >= 3
      ? otherAnswers.slice(0, 3)
      : [...otherAnswers, ...fallbackOptions.slice(0, 3 - otherAnswers.length)];

  const options = [correctAnswer, ...distractors];

  // Shuffle with Fisher-Yates so the correct answer is not always first.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const correctIndex = options.indexOf(correctAnswer);
  return { options, correctIndex };
}

export function QuizCard({ cards }: QuizCardProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  const { options, correctIndex } = useMemo(
    () => generateOptions(currentCard),
    [currentCard]
  );

  // Reset selection state whenever the card changes.
  useEffect(() => {
    setSelectedIndex(null);
    setShowResult(false);
  }, [currentIndex]);

  function handleSelect(index: number) {
    if (showResult) return;
    setSelectedIndex(index);
    setShowResult(true);
  }

  async function handleNext() {
    if (!currentCard) return;
    setLoading(true);
    setError(null);

    const isCorrect = selectedIndex === correctIndex;
    const quality = isCorrect ? 4 : 0;

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
          <div className="grid grid-cols-1 gap-2">
            {options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = index === correctIndex;
              let buttonClass =
                "border-mnemo-border text-mnemo-text hover:bg-mnemo-background rounded-lg h-auto py-3 justify-start text-left";

              if (showResult) {
                if (isCorrect) {
                  buttonClass =
                    "border-emerald-300 bg-emerald-50 text-emerald-800 rounded-lg h-auto py-3 justify-start text-left";
                } else if (isSelected) {
                  buttonClass =
                    "border-red-300 bg-red-50 text-red-800 rounded-lg h-auto py-3 justify-start text-left";
                } else {
                  buttonClass =
                    "border-mnemo-border text-mnemo-muted rounded-lg h-auto py-3 justify-start text-left";
                }
              } else if (isSelected) {
                buttonClass =
                  "border-mnemo-accent bg-mnemo-accent/5 text-mnemo-text rounded-lg h-auto py-3 justify-start text-left";
              }

              return (
                <Button
                  key={index}
                  disabled={showResult || loading}
                  onClick={() => handleSelect(index)}
                  variant="outline"
                  className={buttonClass}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-sm leading-snug">{option}</span>
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className="space-y-3">
              {selectedIndex === correctIndex ? (
                <div className="flex items-center gap-2 text-emerald-700 text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Correct!</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Not quite</span>
                  </div>
                  <p className="text-sm text-mnemo-muted">
                    The correct answer was: <span className="text-mnemo-text font-medium">{currentCard.answer}</span>
                  </p>
                </div>
              )}

              {error && <p className="text-xs text-red-600 text-center">{error}</p>}

              <Button
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-mnemo-primary hover:bg-mnemo-primary/90 text-white rounded-lg h-11"
              >
                {loading ? "Saving..." : "Next question"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
