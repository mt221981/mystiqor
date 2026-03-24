/**
 * מגביל קצב בקשות — Upstash Redis sliding window
 * מגן על נקודות קצה רגישות (LLM, העלאת קבצים) מפני שימוש יתר
 * אם משתני סביבת Upstash לא מוגדרים — מדלג ומאפשר הכל (Pitfall 5)
 */
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** יוצר מגביל קצב עם הגנה נגד חוסר env vars */
function createLimiter(prefix: string, requests: number, window: Duration): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `mystiqor:${prefix}`,
  });
}

/** 10 בקשות LLM ל-60 שניות למשתמש */
export const llmRateLimit = createLimiter('llm', 10, '60 s');

/** 5 העלאות קבצים ל-60 שניות למשתמש */
export const uploadRateLimit = createLimiter('upload', 5, '60 s');

/**
 * בודק הגבלת קצב — מחזיר true אם מותר, false אם חסום
 * מחזיר true אם המגביל לא מוגדר (env vars חסרים)
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit(identifier);
  return success;
}
