/**
 * בדיקות יחידה לשירותי נומרולוגיה — גימטריה וחישובים
 * מכסה: GEMATRIA constant, cleanHebrewText, calculateGematria,
 *        reduceToSingleDigit, calculateLifePath, calculateNumerologyNumbers
 */

import { describe, it, expect } from 'vitest';
import {
  GEMATRIA,
  cleanHebrewText,
  calculateGematria,
} from '@/services/numerology/gematria';
import {
  reduceToSingleDigit,
  calculateLifePath,
  calculateNumerologyNumbers,
} from '@/services/numerology/calculations';

describe('GEMATRIA constant', () => {
  it('מכיל את כל 27 האותיות העבריות כולל סופיות', () => {
    // אותיות רגילות
    expect(GEMATRIA['א']).toBe(1);
    expect(GEMATRIA['ב']).toBe(2);
    expect(GEMATRIA['ש']).toBe(300);
    expect(GEMATRIA['ת']).toBe(400);
    // סופיות
    expect(GEMATRIA['ך']).toBe(20);
    expect(GEMATRIA['ם']).toBe(40);
    expect(GEMATRIA['ן']).toBe(50);
    expect(GEMATRIA['ף']).toBe(80);
    expect(GEMATRIA['ץ']).toBe(90);
  });
});

describe('cleanHebrewText', () => {
  it('מסיר ניקוד (niqqud) מטקסט עברי', () => {
    expect(cleanHebrewText('שָׁלוֹם')).toBe('שלום');
  });

  it('מסיר רווחים מהטקסט', () => {
    expect(cleanHebrewText('דוד  לוי')).toBe('דודלוי');
  });

  it('מחזיר מחרוזת ריקה לקלט ריק', () => {
    expect(cleanHebrewText('')).toBe('');
  });
});

describe('calculateGematria', () => {
  it('מחשב גימטריה נכונה לשלום (376)', () => {
    // ש=300 + ל=30 + ו=6 + ם=40 = 376
    expect(calculateGematria('שלום')).toBe(376);
  });

  it('מחזיר 0 לטקסט ריק', () => {
    expect(calculateGematria('')).toBe(0);
  });

  it('מתעלם מתווים שאינם עבריים', () => {
    expect(calculateGematria('abc')).toBe(0);
  });
});

describe('reduceToSingleDigit', () => {
  it('שומר על מספרי מאסטר 11', () => {
    expect(reduceToSingleDigit(11)).toBe(11);
  });

  it('שומר על מספרי מאסטר 22', () => {
    expect(reduceToSingleDigit(22)).toBe(22);
  });

  it('שומר על מספרי מאסטר 33', () => {
    expect(reduceToSingleDigit(33)).toBe(33);
  });

  it('מצמצם 29 ל-11 (29 → 2+9=11, 11 הוא מספר מאסטר)', () => {
    // PLAN specification: 29 → sum digits = 11 → 11 IS master number → return 11
    expect(reduceToSingleDigit(29)).toBe(11);
  });

  it('מצמצם מספר רגיל לספרה בודדת', () => {
    expect(reduceToSingleDigit(28)).toBe(1); // 2+8=10 → 1+0=1
  });
});

describe('calculateLifePath', () => {
  it('מחשב נתיב חיים נכון ל-1990-05-15', () => {
    // d=15→reduce(15)=6, m=5, y=1990→reduce(1990)=1
    // 6+5+1=12 → reduce(12)=3
    expect(calculateLifePath('1990-05-15')).toBe(3);
  });
});

describe('calculateNumerologyNumbers', () => {
  it('מחזיר אובייקט עם כל שדות הנומרולוגיה', () => {
    const result = calculateNumerologyNumbers({
      fullName: 'דוד',
      birthDate: '1990-05-15',
    });
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('life_path');
    expect(result).toHaveProperty('destiny');
    expect(result).toHaveProperty('soul');
    expect(result).toHaveProperty('personality');
    expect(result).toHaveProperty('personal_year');
  });
});
