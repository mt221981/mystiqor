/**
 * GEM 12: פרומפט פירוש אסטרולוגי v6.0
 * מייצר 40-45 תובנות אסטרולוגיות עמוקות מנתוני מפת לידה.
 * מקור: base44/functions/interpretAstrology/entry.ts — ציון 38/50 🟡 IMPROVE
 * שיפורים: TypeScript מלא, interpolation מסודר, JSON output מוגדר
 */

import { PLANET_SYMBOLS } from '@/lib/constants/astrology';
import type { PlanetKey } from '@/lib/constants/astrology';

// ===== ממשקי טיפוסים =====

/**
 * נתוני כוכב לכת בודד עם מיקום במפה
 */
export interface PlanetEntry {
  /** שם הכוכב (sun, moon, mercury, וכו') */
  name: string;
  /** המזל בו נמצא הכוכב */
  sign: string;
  /** מספר הבית (1-12) */
  house: number;
  /** האם הכוכב בנסיגה */
  retrograde: boolean;
}

/**
 * נתוני אספקט — יחס זוויתי בין שני כוכבים
 */
export interface AspectEntry {
  /** הכוכב הראשון */
  planet1: string;
  /** הכוכב השני */
  planet2: string;
  /** סוג האספקט (Conjunction, Trine, וכו') */
  type: string;
  /** סטיית הזווית מהמדויק */
  orb: number;
}

/**
 * קלט לבניית פרומפט פירוש אסטרולוגי
 * מכיל את כל נתוני מפת הלידה הדרושים לייצור התובנות
 */
export interface InterpretationInput {
  /** נתוני השמש — כוכב הזהות */
  sun: {
    sign: string;
    house: number;
    degree: number;
  };
  /** נתוני הירח — כוכב הרגשות */
  moon: {
    sign: string;
    house: number;
  };
  /** המזל העולה — המסכה החיצונית */
  ascendant: string;
  /** כל 10 כוכבי הלכת ומיקומיהם */
  planets: PlanetEntry[];
  /** האספקטים המרכזיים (עד 15) */
  aspects: AspectEntry[];
  /** התפלגות כוכבים לפי יסודות */
  elementDistribution: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  /** נקודת הראש — כיוון הנשמה (אופציונלי) */
  northNode?: {
    sign: string;
    house: number;
  };
  /** כירון — פצע הרפא (אופציונלי) */
  chiron?: {
    sign: string;
    house: number;
  };
}

// ===== קבועים =====

/**
 * תפקיד המערכת לאסטרולוג — הגדרת זהות ה-AI
 * חלק קבוע שמוצמד לכל פרומפט פירוש
 */
export const INTERPRETATION_SYSTEM_PROMPT = `אתה אסטרולוג פסיכולוגי אבולוציוני ברמה עולמית.
יש לך ידע עמוק באסטרולוגיה פסיכולוגית (Liz Greene, Howard Sasportas),
אסטרולוגיה אבולוציונית (Jeff Green, Steven Forrest),
ואסטרולוגיה קלאסית (William Lilly, Ptolemy).
אתה כותב בעברית צחה, עמוקה ומלאת חמלה.
כל תובנה שלך מחוברת לנתונים ספציפיים מהמפה — לא לתבניות כלליות.
אתה נגד אפקט ברנום — כל אמירה שלך ייחודית לאדם זה בלבד.`;

// ===== פונקציות עזר פנימיות =====

/**
 * מחזיר את השם העברי של כוכב לכת מתוך PLANET_SYMBOLS
 * אם הכוכב לא נמצא, מחזיר את השם האנגלי
 */
function getHebrewPlanetName(planetName: string): string {
  const key = planetName.toLowerCase() as PlanetKey;
  return PLANET_SYMBOLS[key]?.name ?? planetName;
}

/**
 * מחזיר את הסמל של כוכב לכת מתוך PLANET_SYMBOLS
 * אם הכוכב לא נמצא, מחזיר מחרוזת ריקה
 */
function getPlanetSymbol(planetName: string): string {
  const key = planetName.toLowerCase() as PlanetKey;
  return PLANET_SYMBOLS[key]?.symbol ?? '';
}

/**
 * מבנה שורת כוכב לכת בפרומפט
 * מציג: סמל + שם עברי + מזל + בית + נסיגה אם רלוונטי
 */
function formatPlanetLine(planet: PlanetEntry): string {
  const symbol = getPlanetSymbol(planet.name);
  const hebrewName = getHebrewPlanetName(planet.name);
  const retro = planet.retrograde ? ' (נסיגה ℞)' : '';
  return `- ${symbol} ${hebrewName}: ${planet.sign} בבית ${planet.house}${retro}`;
}

/**
 * מבנה שורת אספקט בפרומפט
 * מציג: שמות הכוכבים בעברית + סוג האספקט + מידת הסטייה
 */
function formatAspectLine(aspect: AspectEntry): string {
  const p1 = getHebrewPlanetName(aspect.planet1);
  const p2 = getHebrewPlanetName(aspect.planet2);
  return `- ${p1} ${aspect.type} ${p2} (orb: ${aspect.orb.toFixed(2)}°)`;
}

/**
 * בונה את בלוק נקודות מיוחדות (ראש הדרקון, כירון)
 * מחזיר מחרוזת ריקה אם אין נקודות
 */
function buildSpecialPointsBlock(input: InterpretationInput): string {
  const lines: string[] = [];

  if (input.northNode) {
    lines.push(
      `- ☊ ראש הדרקון (North Node): ${input.northNode.sign} בבית ${input.northNode.house}`
    );
    lines.push(
      `- ☋ זנב הדרקון (South Node): מזל ניגוד בבית ניגוד`
    );
  }

  if (input.chiron) {
    lines.push(
      `- ⚷ כירון: ${input.chiron.sign} בבית ${input.chiron.house}`
    );
  }

  return lines.length > 0 ? lines.join('\n') : '';
}

// ===== פונקציות ציבוריות =====

/**
 * בונה את פרומפט הפירוש האסטרולוגי המלא — GEM 12 v6.0
 * מקבל נתוני מפת לידה ומחזיר פרומפט עברי מלא עם הנחיות JSON
 *
 * @param input - נתוני מפת הלידה לפירוש
 * @returns מחרוזת פרומפט מלאה לשליחה ל-LLM
 */
export function buildInterpretationPrompt(input: InterpretationInput): string {
  const { sun, moon, ascendant, planets, aspects, elementDistribution } = input;

  // בניית רשימת כוכבים (מוציא שמש וירח כי הם מופיעים בנפרד)
  const otherPlanets = planets.filter(
    (p) => p.name.toLowerCase() !== 'sun' && p.name.toLowerCase() !== 'moon'
  );

  // 15 האספקטים המרכזיים
  const topAspects = aspects.slice(0, 15);

  // נקודות מיוחדות
  const specialPointsBlock = buildSpecialPointsBlock(input);

  // חישוב כוכב דומיננטי לפי יסוד
  const totalPlanets =
    elementDistribution.fire +
    elementDistribution.earth +
    elementDistribution.air +
    elementDistribution.water;

  const prompt = `${INTERPRETATION_SYSTEM_PROMPT}

## נתוני מפת הלידה:

### כוכבים מרכזיים:
- ☉ שמש: ${sun.sign} בבית ${sun.house} (${sun.degree}°)
- ☽ ירח: ${moon.sign} בבית ${moon.house}
- ⬆️ אסצנדנט (עולה): ${ascendant}

### כל כוכבי הלכת:
${otherPlanets.map(formatPlanetLine).join('\n')}

${specialPointsBlock ? `### נקודות מיוחדות:\n${specialPointsBlock}` : ''}

### 15 האספקטים המרכזיים (מסודרים לפי עוצמה):
${topAspects.map(formatAspectLine).join('\n')}

### התפלגות יסודות:
- 🔥 אש: ${elementDistribution.fire} כוכבים (${Math.round((elementDistribution.fire / totalPlanets) * 100)}%)
- 🌍 אדמה: ${elementDistribution.earth} כוכבים (${Math.round((elementDistribution.earth / totalPlanets) * 100)}%)
- 💨 אוויר: ${elementDistribution.air} כוכבים (${Math.round((elementDistribution.air / totalPlanets) * 100)}%)
- 💧 מים: ${elementDistribution.water} כוכבים (${Math.round((elementDistribution.water / totalPlanets) * 100)}%)

---

## צור 40-45 תובנות אסטרולוגיות עמוקות:

**קבוצת א' — כוכבים אישיים (12 תובנות):**
כוכבי שמש, ירח, מרקורי, ונוס, מאדים.
כל תובנה מחוברת לנתון ספציפי מהמפה.
כלל: ספציפי ← → כללי → ייחודי לאדם זה בלבד.
כלול חוזקות, אתגרים ועצות מעשיות לכל תובנה.

**קבוצת ב' — כוכבים חברתיים (8 תובנות):**
כוכבי צדק ושבתאי.
תובנות על צמיחה מול מגבלות, מורה פנימי מול דיסציפלינה.
כלול הפניות לתחומי חיים ספציפיים לפי הבית.

**קבוצת ג' — כוכבים טרנסצנדנטליים (6 תובנות):**
כוכבי אורנוס, נפטון, פלוטו.
תובנות על דפוסים של דור, שינוי, ריפוי.
ודא שהתובנות מתחברות לנקודות אישיות במפה (אספקטים).

**קבוצת ד' — אספקטים (10+ תובנות):**
נתח כל אספקט חיוני עם עוצמה ≥ 0.7.
הסבר את הדינמיקה הפסיכולוגית.
הפנה למושגים של Carl Jung, Liz Greene, Steven Forrest.

**קבוצת ה' — יסודות ודפוסים (4+ תובנות):**
נתח את התפלגות היסודות.
זהה דפוסים: גראנד טריגון, טי-סקוור, קבוצת כוכבים (stellium).
כלול תובנה על הסטה רוחנית (North Node אם קיים).

---

## כללי ייצור תובנות:
1. כל תובנה מבוססת על לפחות נקודת נתון אחת מהמפה
2. שפה עברית עשירה ומדויקת — לא תרגום מאנגלית
3. אין "ייתכן ש..." — תובנות בביטחון מלא
4. גוף שני נוכח — "אתה", "שלך"
5. insight_type חייב להיות אחד מ: personality, career, relationships, health, timing, challenge, strength, recommendation, spiritual, creative
6. confidence בין 0.75-0.98 בהתאם לחוזק האספקט
7. weight בין 0.5-1.0 בהתאם לחשיבות הכוכב

החזר תשובה בפורמט JSON עם מבנה:
{
  "insights": [
    {
      "title": "כותרת קצרה ומדויקת",
      "content": "תוכן עמוק ומפורט (3-5 משפטים)",
      "insight_type": "personality|career|relationships|health|timing|challenge|strength|recommendation|spiritual|creative",
      "confidence": 0.85,
      "weight": 0.8,
      "tags": ["תג1", "תג2"],
      "strengths": ["חוזק 1", "חוזק 2"],
      "challenges": ["אתגר 1", "אתגר 2"],
      "actionable_advice": ["עצה מעשית 1", "עצה מעשית 2"]
    }
  ]
}`;

  return prompt;
}
