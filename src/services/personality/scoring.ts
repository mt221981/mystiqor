/**
 * שירות ניקוד Big Five — חישוב ציוני OCEAN מתשובות ליקרט
 * מיישם ניקוד הפוך (6 - ציון_גולמי) ונורמליזציה ל-0-100
 * מדוע: לוגיקה עסקית טהורה שניתן לבדוק ביחידה — ללא תלות ב-DB או HTTP
 */

import {
  BIG_FIVE_QUESTIONS,
  type BigFiveDimension,
} from '@/lib/constants/big-five-questions'

/** ציוני חמשת הממדים — ערך 0-100 לכל ממד */
export interface BigFiveScores {
  /** פתיחות לניסיון */
  openness: number
  /** מצפוניות */
  conscientiousness: number
  /** מוחצנות */
  extraversion: number
  /** נעימות */
  agreeableness: number
  /** רגישות רגשית */
  neuroticism: number
}

/** שגיאת ניקוד — קלט לא תקין */
class BigFiveScoringError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BigFiveScoringError'
  }
}

/**
 * מחשב ציוני Big Five מ-20 תשובות ליקרט
 *
 * אלגוריתם:
 * 1. ולידציה — חייב להיות בדיוק 20 תשובות, כל אחת 1-5
 * 2. ניקוד הפוך — לפריטים עם isReversed: true, הציון האפקטיבי הוא 6 - ציון_גולמי
 * 3. סיכום — 4 ציונים לכל ממד
 * 4. נורמליזציה — ((סכום - 4) / 16) * 100 → טווח 0-100
 *
 * @param answers - מערך של 20 תשובות בסדר שאלות הקבוע (1-5 ליקרט)
 * @returns ציוני BigFiveScores — ערך 0-100 לכל ממד
 * @throws BigFiveScoringError אם הקלט לא תקין
 */
export function scoreBigFive(answers: number[]): BigFiveScores {
  // ולידציה — חייב בדיוק 20 תשובות
  if (answers.length !== 20) {
    throw new BigFiveScoringError(
      `נדרשות בדיוק 20 תשובות, התקבלו ${answers.length}`
    )
  }

  // ולידציה — כל תשובה חייבת להיות 1-5
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i]
    if (
      answer === undefined ||
      !Number.isInteger(answer) ||
      answer < 1 ||
      answer > 5
    ) {
      throw new BigFiveScoringError(
        `תשובה ${i + 1} לא תקינה: ${String(answer)} — נדרש מספר שלם 1-5`
      )
    }
  }

  // איסוף ציונים לפי ממד
  const dimensionSums: Record<BigFiveDimension, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  }

  for (let i = 0; i < BIG_FIVE_QUESTIONS.length; i++) {
    const question = BIG_FIVE_QUESTIONS[i]
    const rawScore = answers[i]

    if (question === undefined || rawScore === undefined) continue

    // ניקוד הפוך — פריטים עם isReversed: true
    const effectiveScore = question.isReversed ? 6 - rawScore : rawScore
    dimensionSums[question.dimension] += effectiveScore
  }

  /**
   * נורמליזציה לטווח 0-100
   * 4 פריטים לממד, מינימום = 4 (כולם 1), מקסימום = 20 (כולם 5)
   * נוסחה: ((סכום - 4) / 16) * 100
   */
  const normalize = (sum: number): number =>
    Math.round(((sum - 4) / 16) * 100)

  return {
    openness: normalize(dimensionSums.openness),
    conscientiousness: normalize(dimensionSums.conscientiousness),
    extraversion: normalize(dimensionSums.extraversion),
    agreeableness: normalize(dimensionSums.agreeableness),
    neuroticism: normalize(dimensionSums.neuroticism),
  }
}
