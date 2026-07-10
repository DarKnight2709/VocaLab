import { SrsRating } from '@/common/enums/srs-rating.enum';

export interface SrsParams {
  repetitions: number;
  interval: number;
  easeFactor: number;
}

export interface SrsResult {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculates the next spaced repetition interval using the SM-2 algorithm.
 * 
 * Quality definitions:
 * - 5: Perfect recall ("EASY")
 * - 4: Correct recall after hesitation ("GOOD")
 * - 3: Correct recall with serious difficulty ("HARD")
 * - 1: Incorrect recall but recognized ("AGAIN")
 */
export function calculateSM2(rating: SrsRating, current: SrsParams): SrsResult {
  let { repetitions, interval, easeFactor } = current;
  
  // Map rating to SM-2 quality (0-5)
  let quality = 4; // Default to GOOD
  switch (rating) {
    case 'AGAIN':
      quality = 1;
      break;
    case 'HARD':
      quality = 3;
      break;
    case 'GOOD':
      quality = 4;
      break;
    case 'EASY':
      quality = 5;
      break;
  }

  // Adjust Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // EF cannot fall below 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // If quality is below 3 (unsuccessful review)
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    repetitions,
    interval,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    nextReviewDate,
  };
}
