# Phase 18: Tarot Card Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 18-tarot-card-library
**Areas discussed:** העשרת הדאטה, פריסות ואינטראקציה, תצוגת פרטי קלף, קלפים הפוכים

---

## העשרת הדאטה

| Option | Description | Selected |
|--------|-------------|----------|
| סנכרון מ-tarot-data.ts | סקריפט שמעדכן את ה-DB מהקובץ הקיים — מוסיף עמודות לטבלת tarot_cards | ✓ |
| Seed SQL חדש | קובץ SQL שמכיל את כל הדאטה ישירות ל-DB | |
| תן לקלוד להחליט | Claude decides approach | |

**User's choice:** סנכרון מ-tarot-data.ts
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| כל השדות מ-TS | הוסף element, astrology, kabbalah, archetype, upright_keywords, reversed_keywords | |
| גם ערך נומרולוגי | הוסף גם עמודת numerology_value מעבר למה שב-TS | ✓ |
| תן לקלוד להחליט | Claude decides columns | |

**User's choice:** גם ערך נומרולוגי
**Notes:** None

---

## פריסות ואינטראקציה

| Option | Description | Selected |
|--------|-------------|----------|
| פריסה קלאסית עם צלב | Layout שמדמה את הצלב הקלטי המסורתי — 6 בצלב, 4 בעמודה ימנית | ✓ |
| גריד פשוט | Grid רגיל של 2×5 עם תוויות עמדה | |
| תן לקלוד להחליט | Claude decides layout | |

**User's choice:** פריסה קלאסית עם צלב
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| היפוך קלף (card flip) | הקלף מתהפך מגב לפנים עם אנימציה 3D | ✓ |
| Fade-in הדרגתי | קלפים מופיעים בהדרגה עם stagger — כמו ProgressiveReveal הקיים | |
| בלי אנימציה | מופיע מיד — בלי אפקטים | |

**User's choice:** היפוך קלף (card flip)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| כפתורי פריסה | כל 4 הפריסות מוצגות ככפתורים עם שם, תיאור ומספר קלפים | ✓ |
| טאבים/כפתורים | טאבים בראש הדף למעבר בין הפריסות | |
| דרופדאון | Dropdown שמאפשר לבחור פריסה — תופס פחות מקום | |

**User's choice:** כפתורי פריסה
**Notes:** None

---

## תצוגת פרטי קלף

| Option | Description | Selected |
|--------|-------------|----------|
| הכל פתוח מיד | כל השדות מוצגים ישר על הקלף | |
| סקציות מתקפלות | שם + ארקנה + מילות מפתח גלויים, לחיצה פותחת מטא-דאטה עשירה | ✓ |
| מודאל/דף פרטים | לחיצה על קלף פותח modal/drawer עם כל הפרטים המלאים | |

**User's choice:** סקציות מתקפלות
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| באדג'ים צבעוניים | תגיות קטנות צבעוניות לכל שדה — אלמנט בצבע שלו, כוכב עם סמל | ✓ |
| טקסט פשוט | רשימה פשוטה — מזל, התאמה אסטרולוגית, נתיב קבלה | |
| תן לקלוד להחליט | Claude decides style | |

**User's choice:** באדג'ים צבעוניים
**Notes:** None

---

## קלפים הפוכים

| Option | Description | Selected |
|--------|-------------|----------|
| כן, אקראי | כל קלף שנשלף יש סיכוי שיופיע הפוך — מילות מפתח שונות, אינדיקציה ויזואלית | |
| לא, רק upright | כל הקלפים תמיד ישרים — פשוט יותר, פחות מבלבל | ✓ |
| אופציונלי למשתמש | המשתמש בוחר אם לכלול קלפים הפוכים בהגדרות | |

**User's choice:** לא, רק upright
**Notes:** הדאטה של reversed_keywords עדיין נשמר ב-DB (דרישת TAROT-02) אבל לא בשימוש בפריסה

---

## Claude's Discretion

- רזולוציית הצלב הקלטי ב-responsive (mobile vs desktop)
- סדר הצגת שדות המטא-דאטה בסקציה המתקפלת
- הגדרת ערכי numerology_value לכל קלף

## Deferred Ideas

None — discussion stayed within phase scope
