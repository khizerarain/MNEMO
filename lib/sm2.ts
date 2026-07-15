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

export function sm2(card: QuizCard, quality: number): Sm2Result {
  let { repetitions, easiness_factor, interval_days } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * easiness_factor);

    repetitions += 1;
  } else {
    repetitions = 0;
    interval_days = 1;
  }

  easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easiness_factor < 1.3) easiness_factor = 1.3;

  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  return { repetitions, easiness_factor, interval_days, next_review_at };
}

export const qualityFromRating = {
  forgot: 0,
  hard: 2,
  good: 4,
  easy: 5,
} as const;

export type Rating = keyof typeof qualityFromRating;
