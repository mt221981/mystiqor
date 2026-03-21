# MystiQor — פלטפורמת ניתוח מיסטי-פסיכולוגי אישי

## What This Is

MystiQor היא פלטפורמה מקיפה לניתוח אישי המשלבת כלים מיסטיים ופסיכולוגיים — אסטרולוגיה, נומרולוגיה, ניתוח ציורים, גרפולוגיה, טארוט, Human Design ועוד — עם AI Coach שמסנתז תובנות מכל הכלים לתמונה אחת שלמה. המערכת בנויה בעברית (RTL) עם מודל מנויים (Stripe) ומיועדת למשתמשים שרוצים הבנה עמוקה של עצמם דרך שילוב כלים מיסטיים.

## Core Value

**ניתוח אישי מיסטי מקיף שמחבר בין כל הכלים** — אסטרולוגיה, נומרולוגיה, ציורים, גרפולוגיה — עם AI שמסנתז את הכל לתובנות אישיות אחודות. לא כלים בודדים, אלא תמונה שלמה.

## Requirements

### Validated

הפיצ'רים הבאים קיימים ועובדים במערכת המקורית (BASE44):

- ✓ **אסטרולוגיה מלאה** — מפת לידה, טרנזיטים, Solar Return, סינסטרי, תחזית יומית, לוח אסטרולוגי, קריאות — existing
- ✓ **נומרולוגיה** — חישוב מספרי חיים, תאימות נומרולוגית — existing
- ✓ **ניתוח ציורים** — העלאת ציור, ניתוח פסיכולוגי (HTP, Koppitz, FDM), השוואת ציורים — existing
- ✓ **גרפולוגיה** — ניתוח כתב יד, מעקב התקדמות, ייצוא PDF, השוואות — existing
- ✓ **AI Coach** — ייעוץ AI אישי, היסטוריית שיחות, פעולות מהירות — existing
- ✓ **ניתוח חלומות** — פרשנות חלומות עם AI — existing
- ✓ **ניתוח אישיות** — פרופיל Big Five, תרשים רדאר — existing
- ✓ **מנויים (Stripe)** — תמחור, checkout, webhook, ניהול מנוי, הפניות — existing
- ✓ **Dashboard** — ביוריתם, מדדים, מגמות מצב רוח, מטרות — existing
- ✓ **תובנות יומיות** — תובנה יומית (טארוט+נומרולוגיה+אסטרולוגיה) — existing
- ✓ **מעקב מצב רוח** — כניסות מצב רוח, מגמות, תרשימים — existing
- ✓ **יומן אישי** — רשומות יומן עם תגים ותובנות — existing
- ✓ **מטרות** — הגדרת מטרות, מעקב התקדמות, המלצות AI — existing
- ✓ **Onboarding** — תהליך הצטרפות מונחה — existing
- ✓ **פרופיל משתמש** — עריכה, ניהול פרופילים מרובים — existing
- ✓ **התראות** — מנהל התראות, תזכורות — existing
- ✓ **ייצוא PDF** — ייצוא ניתוחים ל-PDF — existing
- ✓ **שיתוף חברתי** — שיתוף תוצאות ברשתות — existing
- ✓ **תאימות** — תאימות אסטרולוגית ונומרולוגית בין שני אנשים — existing
- ✓ **כלי תזמון** — מציאת ימים מועדפים למטרות שונות — existing
- ✓ **סינתזה מיסטית** — שילוב תובנות ממספר כלים — existing
- ✓ **הדרכה/טיוטור** — מדריכים, טיוטור אסטרולוגיה וציורים — existing
- ✓ **ניתוח מסמכים** — העלאה וניתוח מסמכים — existing
- ✓ **RTL + עברית** — ממשק מלא בעברית עם RTL — existing
- ✓ **Theme (Light/Dark)** — מצב כהה/בהיר — existing
- ✓ **PWA** — התקנה כאפליקציה, תמיכה offline — existing

### Active

- [ ] מיגרציה ל-Next.js 14+ (App Router) + TypeScript strict
- [ ] מיגרציה ל-Supabase (PostgreSQL + Auth + RLS + Storage)
- [ ] type safety מלא — zero `any`, zero `@ts-ignore`
- [ ] Zod validation על כל API route וטופס
- [ ] React Hook Form על כל טופס
- [ ] React Query + Zustand לניהול state
- [ ] RLS policies על כל טבלה
- [ ] Error handling מקיף עם feedback למשתמש
- [ ] ביצועים — lazy loading, image optimization, pagination
- [ ] נגישות (a11y) — ARIA, keyboard navigation
- [ ] הגנה מ-XSS, input sanitization
- [ ] Rate limiting על endpoints רגישים

### Out of Scope

- אפליקציה מובייל native — Web-first, PWA מספיק לעכשיו
- Multi-language (EN) — עברית בלבד ב-v1
- Real-time collaboration — לא נדרש
- Video/audio content — טקסט ותמונות בלבד
- Self-hosted deployment — Vercel בלבד

## Context

### מערכת מקורית (BASE44)
המערכת המקורית בנויה על BASE44 — פלטפורמת low-code עם:
- **Frontend:** React 18 + React Router + Vite + Tailwind + shadcn/ui
- **Backend:** Deno TypeScript serverless functions (34 פונקציות)
- **DB:** BASE44 entities (NoSQL-like)
- **Auth:** BASE44 auth system
- **Payments:** Stripe integration

### מקור קוד
- `github-source/` — מערכת מקורית (BASE44) — 53 דפים, 100+ קומפוננטות, 34 backend functions
- `mystiqor-build/` — ניסיון build קודם ב-Next.js (Phase 0 Foundation — 127 קבצים, קומפיילציה נקייה)

### GEMs (קטעי קוד איכותיים מהמקור)
6 מתוך 14 GEMs כבר הועברו ל-mystiqor-build:
- GEM 5: forceToString (llm-response.ts)
- GEM 6: Zodiac constants (astrology.ts)
- GEM 7: Plan definitions (plans.ts)
- GEM 8: Cache config (cache-config.ts)
- GEM 10: Error boundary auto-recovery
- GEM 11: Animation presets

### בסיס נתונים (DB Entities)
entities עיקריים מהמקור:
- UserProfile, Subscription, Analysis, DailyInsight
- UserGoal, CoachingJourney, AstrologyCalculation
- PaymentHistory, MoodEntry, Reminder, UserJourney, Chat

### אינטגרציות חיצוניות
- **Stripe** — תשלומים ומנויים (checkout, webhooks, ניהול מנוי)
- **LLM/AI** — יצירת תוכן, פרשנות, ייעוץ (דרך BASE44 proxy)
- **Geocoding** — המרת כתובת לקואורדינטות (לאסטרולוגיה)
- **Email** — התראות, welcome, daily insights

## Constraints

- **Tech Stack:** Next.js 14+ (App Router) + TypeScript strict + Supabase + Tailwind + shadcn/ui
- **Language:** עברית בלבד, RTL, תיעוד בעברית
- **Deployment:** Vercel
- **Security:** RLS על כל טבלה, validation על כל mutation, אין secrets בקליינט
- **Performance:** max 300 שורות לקובץ, lazy loading, pagination
- **Code Quality:** zero `any`, JSDoc בעברית, Zod validation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14+ App Router | SSR, routing, API routes built-in, production-ready | — Pending |
| Supabase במקום BASE44 | PostgreSQL + Auth + RLS + Realtime + Storage, self-hostable | — Pending |
| TypeScript strict | Type safety, refactoring confidence, better DX | — Pending |
| שימוש חוזר בלוגיקה מ-BASE44 | 34 backend functions + UI patterns — לא בונים מאפס | — Pending |
| shadcn/ui (מהמקור) | כבר בשימוש במקור, RTL compatible | ✓ Good |
| React Query + Zustand | כבר בשימוש חלקי במקור, proven pattern | — Pending |

---
*Last updated: 2026-03-22 after reverse engineering of BASE44 source*
