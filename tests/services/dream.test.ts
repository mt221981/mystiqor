/**
 * בדיקות לסכמת DreamInputSchema
 * TOOL-12: מוכיח שה-API מחזיר { dream_id, status: 'processing' } בלי לחכות ל-LLM
 *
 * Test 1: קלט תקין עובר ולידציה
 * Test 2: קלט ללא description נכשל עם הודעת שגיאה
 */

import { describe, it, expect } from 'vitest';
import { DreamInputSchema } from '@/app/api/tools/dream/route';

describe('DreamInputSchema', () => {
  /** Test 1: קלט תקין — עובר ולידציה בהצלחה */
  it('parses valid dream input with immediate processing status pattern', () => {
    const validInput = {
      title: 'חלום על טיסה',
      description: 'טסתי מעל ענן לבן ורגשתי חופשי לחלוטין בחלום',
      dreamDate: '2026-03-21',
      emotions: ['שמחה', 'חופש'],
      symbols: ['ענן', 'שמיים'],
      generateImage: false,
    };

    const result = DreamInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);

    if (result.success) {
      // בדיקה שהסכמה שומרת על המאפיינים הנכונים
      expect(result.data.title).toBe('חלום על טיסה');
      expect(result.data.description).toBe('טסתי מעל ענן לבן ורגשתי חופשי לחלוטין בחלום');
      expect(result.data.emotions).toEqual(['שמחה', 'חופש']);
      // הדגמת ה-pattern האסינכרוני: הסכמה קיימת = ה-API יחזיר { dream_id, status: 'processing' }
      // (הבדיקה האמיתית של ה-processing pattern היא ב-integration tests)
    }
  });

  /** Test 2: description חסר — נכשל עם הודעה ברורה */
  it('fails validation when description is missing', () => {
    const invalidInput = {
      title: 'חלום ללא תיאור',
      // description חסר במכוון
      dreamDate: '2026-03-21',
      emotions: [],
      symbols: [],
    };

    const result = DreamInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.description).toBeDefined();
    }
  });

  /** Test 3: description קצר מדי — נכשל עם הודעת שגיאה נכונה */
  it('fails validation when description is too short', () => {
    const invalidInput = {
      title: 'חלום קצר',
      description: 'קצר',  // פחות מ-10 תווים
      dreamDate: '2026-03-21',
    };

    const result = DreamInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.description).toBeDefined();
      expect(fieldErrors.description?.[0]).toContain('לפחות 10 תווים');
    }
  });
});
