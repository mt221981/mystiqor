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

  it('Test 3: draws exactly 10 cards for Celtic Cross spread (TAROT-01 + TAROT-03)', () => {
    // צלב קלטי דורש 10 קלפים — וידוא שהפונקציה מסוגלת לטפל בכמות גדולה
    const cards = Array.from({ length: 78 }, (_, i) => ({ id: String(i), name: `Card ${i}` }))
    const drawn = drawCards(cards, 10)
    expect(drawn).toHaveLength(10)
  })

  it('Test 4: draws all available cards when count exceeds pool (edge case)', () => {
    // כאשר מבקשים יותר קלפים מהקיימים — מחזיר את כל מה שיש
    const cards = [{ id: '1', name: 'שוטה' }, { id: '2', name: 'קוסם' }]
    const drawn = drawCards(cards, 5)
    expect(drawn).toHaveLength(2) // מקסימום מה שיש
  })
})
