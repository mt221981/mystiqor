# Phase 25: Coach Intelligence & Sidebar Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-30
**Phase:** 25-coach-intelligence-sidebar-polish
**Areas discussed:** Coach Dynamic Context, Sidebar Reorganization, Sidebar localStorage Persistence

---

## Coach Dynamic Context

| Option | Description | Selected |
|--------|-------------|----------|
| בכל הודעה | כל POST ל-/api/coach/messages שולף ניתוחים אחרונים ומצרף ל-system prompt | ✓ |
| רק בתחילת שיחה | context-builder רץ רק פעם ביצירת שיחה חדשה | |
| אתה תחליט | Claude יבחור את האיזון הנכון | |

**User's choice:** בכל הודעה
**Notes:** None

---

## Context Depth

| Option | Description | Selected |
|--------|-------------|----------|
| 5 אחרונים | קומפקטי — מספיק לשיחה רלוונטית, לא מנפח את ה-system prompt | ✓ |
| 10 אחרונים | יותר עומק אבל עוד טוקנים בכל קריאה | |
| רק של היום | ניתוחים מהיום בלבד — הכי רלוונטי אבל חסרון אם לא עשה כלום היום | |

**User's choice:** 5 אחרונים
**Notes:** None

---

## Sidebar Reorganization

| Option | Description | Selected |
|--------|-------------|----------|
| מיסטיים = ראשיים, עוד = מתקדמים | כלים מיסטיים = 8 כלים ראשיים, עוד כלים = השאר | ✓ |
| לפי פופולריות | 8 הכי נפוצים ראשונים, השאר תחת עוד כלים | |
| אתה תחליט | Claude יבחר את החלוקה הטובה ביותר | |

**User's choice:** מיסטיים = ראשיים, עוד = מתקדמים
**Notes:** None

---

## Sidebar localStorage

| Option | Description | Selected |
|--------|-------------|----------|
| פתיחה/סגירה בלבד | רק מצב קטגוריות — אם סגרתי כלים מיסטיים, יישאר סגור אחרי רענון | ✓ |
| פתיחה/סגירה + כלים אחרונים | גם לשמור 3-5 הכלים האחרונים שהמשתמש פתח — להציג כ-recently used | |
| אתה תחליט | Claude יבחר את המינימום הנכון | |

**User's choice:** פתיחה/סגירה בלבד
**Notes:** None

---

## Claude's Discretion

- Hebrew label for analysis context in system prompt
- Relative vs absolute time format
- localStorage JSON structure

## Deferred Ideas

None
