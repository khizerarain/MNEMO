/**
 * SM-2 spaced repetition algorithm.
 *
 * SM-2 is the classic SuperMemo algorithm. It takes a flashcard's current
 * repetition count, easiness factor, and interval, plus a quality rating
 * from the user (0-5), and returns the next interval and review date.
 *
 * Quality meaning:
 *   0 = complete blackout
 *   1 = incorrect response, correct one remembered
 *   2 = incorrect response, easy one remembered
 *   3 = correct with serious difficulty
 *   4 = correct with hesitation
 *   5 = correct with perfect response
 */

export interface QuizCard {
  id: string;
  repetitions: number;
  easiness_factor: number;
  interval_days: number;
  next_review_at: string;
}

export interface Sm2Result {
  repetitions: number;
  easiness_factor: number;
  interval_days: number;
  next_review_at: Date;
}

/**
 * Apply the SM-2 algorithm to a quiz card.
 *
 * @param card - The current state of the quiz card from the database.
 * @param quality - The user's recall quality, 0 to 5.
 * @returns The updated SM-2 state, including the next review date.
 */
export function sm2(card: QuizCard, quality: number): Sm2Result {
  let { repetitions, easiness_factor, interval_days } = card;

  if (quality >= 3) {
    // Correct answer: increase the interval.
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * easiness_factor);

    repetitions += 1;
  } else {
    // Incorrect answer: reset the repetition schedule.
    repetitions = 0;
    interval_days = 1;
  }

  // Adjust the easiness factor based on quality. The formula comes from
  // the original SuperMemo-2 paper. It clamps to a minimum of 1.3.
  easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness_factor < 1.3) easiness_factor = 1.3;

  // Calculate the next review date by adding the interval to today.
  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  return { repetitions, easiness_factor, interval_days, next_review_at };
}

/**
 * Optional helper mapping button labels to SM-2 quality values.
 */
export const qualityFromRating = {
  forgot: 0,
  hard: 2,
  good: 4,
  easy: 5,
} as const;

export type Rating = keyof typeof qualityFromRating;
