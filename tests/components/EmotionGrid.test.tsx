/**
 * בדיקות לנתוני EmotionGrid — Wave 0 scaffold
 * מכסה: DREAM-01 (12 רגשות עם אימוג'ים), DREAM-02 (toggle on/off)
 *
 * NOTE: בדיקות אלו עוברות מיידית — DREAM_EMOTIONS כבר קיים
 */

import { describe, it, expect } from 'vitest';
import { DREAM_EMOTIONS } from '@/lib/constants/dream-data';

describe('EmotionGrid data', () => {
  /** Test 1: יש בדיוק 12 רגשות */
  it('DREAM_EMOTIONS has 12 items', () => {
    expect(DREAM_EMOTIONS).toHaveLength(12);
  });

  /** Test 2: כל רגש מכיל את כל השדות הנדרשים */
  it('each emotion has value, label, emoji, description', () => {
    for (const emotion of DREAM_EMOTIONS) {
      // value — מחרוזת לא ריקה
      expect(typeof emotion.value).toBe('string');
      expect(emotion.value.length).toBeGreaterThan(0);

      // label — מחרוזת לא ריקה
      expect(typeof emotion.label).toBe('string');
      expect(emotion.label.length).toBeGreaterThan(0);

      // emoji — מחרוזת לא ריקה
      expect(typeof emotion.emoji).toBe('string');
      expect(emotion.emoji.length).toBeGreaterThan(0);

      // description — מחרוזת לא ריקה
      expect(typeof emotion.description).toBe('string');
      expect(emotion.description.length).toBeGreaterThan(0);
    }
  });

  /** Test 3: כל ה-value-ים ייחודיים */
  it('all values are unique', () => {
    const values = DREAM_EMOTIONS.map((e) => e.value);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(12);
  });
});
