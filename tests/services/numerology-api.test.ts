/**
 * בדיקות יחידה ל-API נומרולוגיה — מבדיל קלט/פלט בדיזוין
 * מכסה: calculateNumerologyNumbers מחזיר 5 מספרים תקינים
 */

import { describe, it, expect } from 'vitest';
import { calculateNumerologyNumbers } from '@/services/numerology/calculations';

describe('calculateNumerologyNumbers — API context', () => {
  it('Test 1: valid input returns object with all 5 numerology fields as numbers', () => {
    const result = calculateNumerologyNumbers({
      fullName: 'ישראל',
      birthDate: '1990-01-01',
    });
    expect(typeof result.life_path).toBe('number');
    expect(typeof result.destiny).toBe('number');
    expect(typeof result.soul).toBe('number');
    expect(typeof result.personality).toBe('number');
    expect(typeof result.personal_year).toBe('number');
  });

  it('Test 2: life_path is a single digit (1-9) or master number (11, 22, 33)', () => {
    const result = calculateNumerologyNumbers({
      fullName: 'ישראל',
      birthDate: '1990-01-01',
    });
    const validValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    expect(validValues).toContain(result.life_path);
  });
});
