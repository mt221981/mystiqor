/**
 * פרומפט מעברים (Transits)
 * מנתח את מיקומי הכוכבים הנוכחיים יחסית למפת הלידה הנטלית
 * ומייצר תחזיות מבוססות מעברים חיצוניים
 */

import type { InterpretationInput } from './interpretation';
import { INTERPRETATION_SYSTEM_PROMPT } from './interpretation';

// ===== ממשקי טיפוסים =====

/**
 * מיקומי כוכבי לכת בנקודת זמן נתונה
 * משמש לניתוח מעברים עכשוויים
 */
export interface PlanetPositions {
  /** מיקום השמש */
  sun?: { sign: string; degree: number };
  /** מיקום הירח */
  moon?: { sign: string; degree: number };
  /** מיקום מרקורי */
  mercury?: { sign: string; retrograde: boolean };
  /** מיקום ונוס */
  venus?: { sign: string };
  /** מיקום מאדים */
  mars?: { sign: string };
  /** מיקום צדק */
  jupiter?: { sign: string; house?: number };
  /** מיקום שבתאי */
  saturn?: { sign: string; house?: number; retrograde?: boolean };
  /** מיקום אורנוס */
  uranus?: { sign: string; house?: number };
  /** מיקום נפטון */
  neptune?: { sign: string; house?: number };
  /** מיקום פלוטו */
  pluto?: { sign: string; house?: number };
}

/**
 * קלט לבניית פרומפט מעברים
 * משלב מפת לידה נטלית עם מיקומי הכוכבים הנוכחיים
 */
export interface TransitPromptInput {
  /** מפת הלידה הנטלית — בסיס הניתוח */
  natalChart: InterpretationInput;
  /** מיקומי הכוכבים הנוכחיים */
  currentTransits: PlanetPositions;
  /** תאריך היעד לניתוח */
  targetDate: Date;
}

// ===== פונקציות עזר פנימיות =====

/**
 * מעצב תאריך לפורמט עברי DD/MM/YYYY
 */
function formatDateHebrew(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * בונה תיאור קצר של מיקומי כוכבים חיצוניים (שבתאי, אורנוס, נפטון, פלוטו)
 * אלה הכוכבים בעלי ההשפעה ארוכת הטווח
 */
function buildOuterPlanetsBlock(transits: PlanetPositions): string {
  const lines: string[] = [];

  if (transits.saturn) {
    const retro = transits.saturn.retrograde ? ' (נסיגה ℞)' : '';
    const house = transits.saturn.house ? ` — בית ${transits.saturn.house} בנטלי` : '';
    lines.push(`- ♄ שבתאי: ${transits.saturn.sign}${retro}${house}`);
  }

  if (transits.uranus) {
    const house = transits.uranus.house ? ` — בית ${transits.uranus.house} בנטלי` : '';
    lines.push(`- ♅ אורנוס: ${transits.uranus.sign}${house}`);
  }

  if (transits.neptune) {
    const house = transits.neptune.house ? ` — בית ${transits.neptune.house} בנטלי` : '';
    lines.push(`- ♆ נפטון: ${transits.neptune.sign}${house}`);
  }

  if (transits.pluto) {
    const house = transits.pluto.house ? ` — בית ${transits.pluto.house} בנטלי` : '';
    lines.push(`- ♇ פלוטו: ${transits.pluto.sign}${house}`);
  }

  return lines.length > 0 ? lines.join('\n') : '(אין נתוני כוכבים חיצוניים)';
}

/**
 * בונה תיאור קצר של מיקומי כוכבים מהירים (שמש, ירח, מרקורי, ונוס, מאדים, צדק)
 */
function buildInnerPlanetsBlock(transits: PlanetPositions): string {
  const lines: string[] = [];

  if (transits.sun) {
    lines.push(`- ☉ שמש: ${transits.sun.sign} (${transits.sun.degree.toFixed(1)}°)`);
  }

  if (transits.moon) {
    lines.push(`- ☽ ירח: ${transits.moon.sign} (${transits.moon.degree.toFixed(1)}°)`);
  }

  if (transits.mercury) {
    const retro = transits.mercury.retrograde ? ' (נסיגה ℞)' : '';
    lines.push(`- ☿ מרקורי: ${transits.mercury.sign}${retro}`);
  }

  if (transits.venus) {
    lines.push(`- ♀ ונוס: ${transits.venus.sign}`);
  }

  if (transits.mars) {
    lines.push(`- ♂ מאדים: ${transits.mars.sign}`);
  }

  if (transits.jupiter) {
    const house = transits.jupiter.house ? ` — בית ${transits.jupiter.house} בנטלי` : '';
    lines.push(`- ♃ צדק: ${transits.jupiter.sign}${house}`);
  }

  return lines.length > 0 ? lines.join('\n') : '(אין נתוני כוכבים מהירים)';
}

// ===== פונקציות ציבוריות =====

/**
 * בונה פרומפט מעברים אסטרולוגיים לתאריך ספציפי
 * מנתח את מיקומי הכוכבים הנוכחיים ביחס למפת הלידה הנטלית
 *
 * @param input - מפת הלידה, מיקומי הכוכבים הנוכחיים ותאריך היעד
 * @returns מחרוזת פרומפט עברית מלאה לשליחה ל-LLM
 */
export function buildTransitsPrompt(input: TransitPromptInput): string {
  const { natalChart, currentTransits, targetDate } = input;

  const formattedDate = formatDateHebrew(targetDate);

  return `${INTERPRETATION_SYSTEM_PROMPT}

## ניתוח מעברים לתאריך: ${formattedDate}

### מפת הלידה הנטלית:
- שמש נטלית: ${natalChart.sun.sign} בבית ${natalChart.sun.house} (${natalChart.sun.degree}°)
- ירח נטלי: ${natalChart.moon.sign} בבית ${natalChart.moon.house}
- עולה: ${natalChart.ascendant}

### מעברים עכשוויים — כוכבים חיצוניים (השפעה ארוכת טווח):
${buildOuterPlanetsBlock(currentTransits)}

### מעברים עכשוויים — כוכבים מהירים (השפעה קצרת טווח):
${buildInnerPlanetsBlock(currentTransits)}

---

## הנחיות ניתוח:

**עדיפות גבוהה — כוכבים חיצוניים (שבתאי, אורנוס, נפטון, פלוטו):**
- אלה המעברים בעלי ההשפעה הארוכה ביותר (חודשים עד שנים)
- נתח כל מעבר חיצוני שנמצא בשלושה בתים מרכזיים במפה הנטלית
- ציין אם המעבר בחיבור, ניגוד, ריבוע או טריגון לכוכב נטלי

**עדיפות בינונית — צדק ושבתאי:**
- נתח השפעות חברתיות ומקצועיות
- ציין חלוני הזדמנות (טריגונים/סקסטילים לצדק)

**עדיפות נמוכה — כוכבים מהירים:**
- שמש וירח — מצבי רוח ואנרגיה יומיומית
- מרקורי בנסיגה — אם רלוונטי

---

החזר תשובה בפורמט JSON:
{
  "date": "${formattedDate}",
  "dominant_theme": "הנושא הדומיננטי של התקופה",
  "transits": [
    {
      "planet": "שם הכוכב",
      "type": "outer|inner",
      "aspect_to_natal": "סוג האספקט לכוכב נטלי (אם קיים)",
      "natal_planet": "הכוכב הנטלי המושפע",
      "interpretation": "פירוש מפורט (3-4 משפטים)",
      "duration": "days|weeks|months|years",
      "intensity": "high|medium|low",
      "advice": "המלצה מעשית"
    }
  ],
  "energy_level": "high|medium|low",
  "best_focus": "מה הכי כדאי להתמקד בו כעת",
  "caution": "מה כדאי להיזהר ממנו"
}`;
}
