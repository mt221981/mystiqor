/**
 * בדיקות יחידה ללוגיקת שליפת קלפי טארוט
 * מכסה: בחירה אקראית מרשימה + טיפול במקרי קצה (רשימה ריקה)
 */

import { describe, it, expect } from 'vitest'

// ===== לוגיקת בחירת קלפים מבודדת =====

/**
 * בוחרת מספר קלפים אקראיים מרשימה (ישירות מ-route.ts — extracted pure function)
 * מדוע: מבדד את לוגיקת הבחירה האקראית לבדיקה בלי תלות ב-Supabase
 */
function drawCards<T>(allCards: T[], count: number): T[] {
  if (allCards.length === 0) return []
  const shuffled = [...allCards].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ===== בדיקות =====

describe('drawCards — tarot card selection logic', () => {
  it('Test 1: draws exactly 3 cards from a pool of 5', () => {
    const cards = [
      { id: '1', name: 'שוטה' },
      { id: '2', name: 'קוסם' },
      { id: '3', name: 'כוהנת הגדולה' },
      { id: '4', name: 'אימפריאלית' },
      { id: '5', name: 'קיסר' },
    ]
    const drawn = drawCards(cards, 3)
    expect(drawn).toHaveLength(3)
  })

  it('Test 2: empty DB (0 rows) returns empty array — no crash', () => {
    const drawn = drawCards([], 3)
    expect(drawn).toHaveLength(0)
    expect(Array.isArray(drawn)).toBe(true)
  })
})
