/**
 * בדיקות יחידה לכלי התאימות — פונקציית calculateCombinedScore
 * TOOL-13: נומרולוגיה 40% + אסטרולוגיה 60% = ציון תאימות כולל
 *
 * מדוע: מכסה את הנוסחה המשוקללת המרכזית — הלב החישובי של הכלי
 */

import { describe, it, expect } from 'vitest';
import { calculateCombinedScore } from '@/app/api/tools/compatibility/route';

describe('calculateCombinedScore — ציון תאימות משוקלל (TOOL-13)', () => {
  it('נומרולוגיה=80, אסטרולוגיה=60 → ציון כולל=68', () => {
    // 80*0.40 + 60*0.60 = 32 + 36 = 68
    expect(calculateCombinedScore(80, 60)).toBe(68);
  });

  it('נומרולוגיה=50, אסטרולוגיה=90 → ציון כולל=74', () => {
    // 50*0.40 + 90*0.60 = 20 + 54 = 74
    expect(calculateCombinedScore(50, 90)).toBe(74);
  });

  it('ציון כולל מוגבל לטווח 0-100 (clamp)', () => {
    // clamp מלמעלה
    expect(calculateCombinedScore(100, 100)).toBe(100);
    // clamp מלמטה
    expect(calculateCombinedScore(0, 0)).toBe(0);
  });
});
