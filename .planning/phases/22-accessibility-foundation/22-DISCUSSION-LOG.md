# Phase 22: Accessibility Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 22-accessibility-foundation
**Areas discussed:** Contrast strategy, z-index scale, reduced-motion scope

---

## Contrast Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| אודיט שקיפויות (מומלץ) | למצוא כל שימוש ב-/60 ומטה ולהעלות ל-/85 מינימום. לא משנה טוקנים בסיסיים — פחות סיכון | ✓ |
| העלאת טוקנים בסיסיים | לשנות את muted-foreground לבהיר יותר כך שגם שימוש בשקיפויות נמוכות יעבוד. שינוי גלובלי יותר — משפיע על 50+ מקומות | |
| שניהם ביחד | אודיט שקיפויות + העלאת muted-foreground קלה — שני הגישות | |

**User's choice:** אודיט שקיפויות — לתקן שימוש לא נכון בשקיפויות, לא לשנות טוקנים בסיסיים
**Notes:** המחקר זיהה text-gold-dim/60 ו-text-on-surface-variant/70 כבעיות העיקריות

---

## Z-Index Scale

| Option | Description | Selected |
|--------|-------------|----------|
| CSS custom properties | הגדרת --z-header, --z-tabs, --z-floating, --z-modal ב-globals.css. כל קומפוננט משתמש ב-var() | ✓ |
| Tailwind config | הוספת zIndex ל-tailwind.config — משתמשים ב-z-header, z-tabs כקלאסים | |
| תחליט | לתת לקלוד להחליט | |

**User's choice:** CSS custom properties ב-globals.css
**Notes:** מאפשר שימוש ב-var(--z-floating) בכל קומפוננט

---

## Reduced-Motion Scope

| Option | Description | Selected |
|--------|-------------|----------|
| כיבוי הכל (מומלץ) | כל ה-keyframes, transitions, ואנימציות נכבות — אפליקציה סטטית לגמרי אבל פונקציונלית | ✓ |
| רק keyframes | רק אנימציות מתקדמות נכבות, transitions (כמו hover) נשארות — חוויה פחות סטטית | |
| תחליט | לתת לקלוד להחליט | |

**User's choice:** כיבוי מלא — הכל נכבה ב-prefers-reduced-motion
**Notes:** None

---

## Claude's Discretion

- ערכי z-index ספציפיים
- שיטת אודיט שקיפויות
- eslint rule vs תיעוד בלבד

## Deferred Ideas

None
