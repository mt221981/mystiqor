# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- ✅ **v1.1 UI Polish** - Phases 13-17 (shipped 2026-04-02)
- ✅ **v1.2 Rich Content & Soul** - Phases 18-21 (shipped 2026-03-29)
- ✅ **v1.3 Mystical UX & Coach Prominence** - Phases 22-25 (shipped 2026-04-01)
- ✅ **v1.4 UI Polish & Visual Identity** - Phases 26-30 (shipped 2026-04-07)
- 🚧 **v1.5 System Hardening** - Phases 31-32 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-12) - SHIPPED 2026-03-25</summary>

12 phases, 66 plans, 308 source files, ~27,300 LOC TypeScript.
See .planning/milestones/v1.0-ROADMAP.md for full details.

</details>

<details>
<summary>v1.1 UI Polish (Phases 13-17) - SHIPPED 2026-04-02</summary>

5 phases, 7 plans, 16 requirements. Onboarding fix, typography, icons, CSS polish, animations.
See .planning/milestones/v1.1-ROADMAP.md for full details.

</details>

<details>
<summary>v1.2 Rich Content & Soul (Phases 18-21) - SHIPPED 2026-03-29</summary>

4 phases, 13 plans. Tarot library, astrology dictionary, dream emotions, blog content, prompt enrichment.
See .planning/milestones/v1.2-ROADMAP.md for full details.

</details>

<details>
<summary>v1.3 Mystical UX & Coach Prominence (Phases 22-25) - SHIPPED 2026-04-01</summary>

4 phases, 10 plans. Accessibility, floating coach, atmospheric styling, coach intelligence.
See .planning/milestones/v1.3-ROADMAP.md for full details.

</details>

<details>
<summary>v1.4 UI Polish & Visual Identity (Phases 26-30) - SHIPPED 2026-04-07</summary>

5 phases, 7 plans, 8 requirements. Lucide icon system, holistic sidebar, dashboard tool cards, gap closure.
See .planning/milestones/v1.4-ROADMAP.md for full details.

</details>

### v1.5 System Hardening (In Progress)

**Milestone Goal:** הפיכת המערכת ליציבה, חסינה ונגישה — שימוש מבוקר, LLM עמיד, UX נגיש

- [x] **Phase 31: Backend Stability** - בדיקת מכסה, timeout/retry, תרגום שגיאות, Zod LLM validation, DB error handling (completed 2026-04-06)
- [ ] **Phase 32: Frontend Accessibility & UX** - RTL margins, contrast, aria-labels, empty states, mobile forms

## Phase Details

### Phase 31: Backend Stability
**Goal**: כל קריאת LLM מוגנת ממכסת-יתר, עמידה בפני תרעומות זמניות, ומחזירה שגיאות עבריות ברורות — ניתוחים לא נאבדים בשקט
**Depends on**: Phase 30
**Requirements**: STAB-01, STAB-02, STAB-03, STAB-04, STAB-05
**Success Criteria** (what must be TRUE):
  1. משתמש שעבר מכסת שימוש חודשית רואה הודעה עברית ברורה ולא מחויב API call ל-OpenAI
  2. כשרשת OpenAI איטית, המערכת מנסה שוב אוטומטית עד שתי פעמים לפני שמציגה שגיאה
  3. שגיאות OpenAI (rate limit, timeout, invalid response) מופיעות בעברית ידידותית — לא קוד גולמי באנגלית
  4. תגובת LLM מעוותת בכלי tarot, palmistry, dream נחסמת על ידי ולידציית Zod ולא מוצגת למשתמש
  5. כשל ב-DB insert מדווח למשתמש בטוסט עברי — ניתוח לא נעלם בשקט
**Plans**: 3 plans

Plans:
- [x] 31-01-PLAN.md — LLM service hardening: timeout/retry + Hebrew error mapping (llm.ts only)
- [x] 31-02-PLAN.md — Usage guard + DB insert error handling (new helper + all 24 routes)
- [x] 31-03-PLAN.md — Zod LLM response validation for tarot, palmistry, dream

### Phase 32: Frontend Accessibility & UX
**Goal**: ממשק המשתמש נגיש, קריא ו-RTL-תקין בכל הרזולוציות — דפים ריקים מנחים, טפסים עובדים במובייל
**Depends on**: Phase 31
**Requirements**: A11Y-01, A11Y-02, A11Y-03, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. בדיקת RTL על כרום + Firefox מראה שאין היפוך margin/padding לא רצוי בשום קומפוננטה
  2. כל טקסט משני עומד ב-WCAG AA contrast (4.5:1) — opacity-40/60 הוחלפו בצבע מוחלט
  3. כל כפתור, טאב ואלמנט אינטראקטיבי קורא נכון עם screen reader — aria-label בעברית
  4. דפי קואצ', מטרות והיסטוריה מראים empty state עם CTA ברור כשאין נתונים — לא מסך ריק
  5. טופס כלשהו עם שדות מרובים מוצג בעמודה אחת במובייל וקואצ' לא שולח יותר מ-10 הודעות לקונטקסט
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 31. Backend Stability | v1.5 | 3/3 | Complete   | 2026-04-06 |
| 32. Frontend Accessibility & UX | v1.5 | 0/TBD | Not started | - |
