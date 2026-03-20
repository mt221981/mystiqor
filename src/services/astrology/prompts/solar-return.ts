/**
 * פרומפט מהפכה שמשית (Solar Return)
 * מייצר 15-20 תחזיות שנתיות על בסיס השוואת מפת הלידה למפה השמשית השנתית.
 * מחובר ל-GEM 12 — משתמש ב-InterpretationInput מהמפה הנטלית
 */

import type { InterpretationInput } from './interpretation';
import { INTERPRETATION_SYSTEM_PROMPT } from './interpretation';

// ===== ממשקי טיפוסים =====

/**
 * קלט לבניית פרומפט מהפכה שמשית
 * משלב מפת לידה נטלית עם מפת המהפכה השמשית לשנה הנבחרת
 */
export interface SolarReturnPromptInput {
  /** מפת הלידה הנטלית — נקודת הייחוס */
  birthChart: InterpretationInput;
  /** מפת המהפכה השמשית לשנה הנבחרת */
  solarReturnChart: InterpretationInput;
  /** שנת המהפכה לחיזוי */
  targetYear: number;
}

// ===== פונקציות ציבוריות =====

/**
 * בונה פרומפט מהפכה שמשית (Solar Return) לשנה ספציפית
 * משווה בין מפת הלידה הנטלית למפת המהפכה השמשית ומייצר תחזיות שנתיות
 *
 * @param input - נתוני מפת הלידה, מפת המהפכה ושנת היעד
 * @returns מחרוזת פרומפט עברית מלאה לשליחה ל-LLM
 */
export function buildSolarReturnPrompt(input: SolarReturnPromptInput): string {
  const { birthChart, solarReturnChart, targetYear } = input;

  // בניית רשימת כוכבים במפת הלידה
  const natalPlanets = birthChart.planets
    .map((p) => `${p.name}: ${p.sign} בבית ${p.house}`)
    .join(', ');

  // בניית רשימת כוכבים במפת המהפכה
  const srPlanets = solarReturnChart.planets
    .map((p) => `${p.name}: ${p.sign} בבית ${p.house}${p.retrograde ? ' ℞' : ''}`)
    .join(', ');

  // בניית רשימת אספקטים מרכזיים במהפכה
  const srAspects = solarReturnChart.aspects
    .slice(0, 10)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(2)}°)`)
    .join(', ');

  return `${INTERPRETATION_SYSTEM_PROMPT}

## מהפכה שמשית לשנת ${targetYear}

### מפת הלידה הנטלית (בסיס):
- שמש נטלית: ${birthChart.sun.sign} בבית ${birthChart.sun.house} (${birthChart.sun.degree}°)
- ירח נטלי: ${birthChart.moon.sign} בבית ${birthChart.moon.house}
- עולה נטלי: ${birthChart.ascendant}
- כוכבים נטליים: ${natalPlanets}

### מפת המהפכה השמשית ${targetYear}:
- שמש: ${solarReturnChart.sun.sign} בבית ${solarReturnChart.sun.house}
- ירח: ${solarReturnChart.moon.sign} בבית ${solarReturnChart.moon.house}
- עולה מהפכה: ${solarReturnChart.ascendant}
- כוכבי המהפכה: ${srPlanets}
- אספקטים מרכזיים: ${srAspects}

### השוואת עולה:
- עולה נטלי: ${birthChart.ascendant}
- עולה מהפכה שמשית: ${solarReturnChart.ascendant}
${birthChart.ascendant === solarReturnChart.ascendant
  ? '⚡ עולה זהה — שנת חזרה לנושאים מרכזיים של הנשמה'
  : `🔄 שינוי עולה — ${birthChart.ascendant} → ${solarReturnChart.ascendant} — פרספקטיבה חדשה`}

---

## צור 15-20 תחזיות לשנת ${targetYear}:

**נושאי ליבה (4-5 תחזיות):**
זהה את 4-5 הנושאים המרכזיים של השנה לפי מיקום כוכבים ואספקטים מרכזיים.
כל נושא עם תחילה, שיא וסיום מוצע.

**תחומי חיים (4-6 תחזיות):**
קריירה, אהבה, בריאות, כספים — לפי בתים פעילים במהפכה.
ציין תקופות חזקות ותקופות אתגר בתוך השנה.

**אתגרים ולמידה (3-4 תחזיות):**
אספקטים מאתגרים (ריבועים, ניגודים) — מה הם מלמדים?
כיצד לנווט את האתגרים.

**הזדמנויות (3-4 תחזיות):**
טריגונים, סקסטילים, חיבורים חיוביים — איפה השנה הכי זורמת.

**המלצות מעשיות (1-2 תחזיות):**
3-5 פעולות קונקרטיות לשנה זו.

---

החזר תשובה בפורמט JSON:
{
  "year": ${targetYear},
  "predictions": [
    {
      "title": "כותרת תחזית",
      "content": "תוכן מפורט (3-4 משפטים)",
      "period": "Q1|Q2|Q3|Q4|כל השנה",
      "category": "career|love|health|finance|spiritual|general",
      "intensity": "high|medium|low"
    }
  ],
  "themes": ["נושא שנתי 1", "נושא שנתי 2", "נושא שנתי 3"],
  "challenges": ["אתגר 1", "אתגר 2"],
  "opportunities": ["הזדמנות 1", "הזדמנות 2", "הזדמנות 3"]
}`;
}
