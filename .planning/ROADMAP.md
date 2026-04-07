# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- ✅ **v1.1 UI Polish** - Phases 13-17 (shipped 2026-04-02)
- ✅ **v1.2 Rich Content & Soul** - Phases 18-21 (shipped 2026-03-29)
- ✅ **v1.3 Mystical UX & Coach Prominence** - Phases 22-25 (shipped 2026-04-01)
- ✅ **v1.4 UI Polish & Visual Identity** - Phases 26-30 (shipped 2026-04-07)
- ✅ **v1.5 System Hardening** - Phases 31-32 (shipped 2026-04-07)
- 🚧 **v1.6 Enriched Experience** - Phases 33-35 (in progress)

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

<details>
<summary>v1.5 System Hardening (Phases 31-32) - SHIPPED 2026-04-07</summary>

2 phases, 4 plans, 10 requirements. Usage guard, LLM resilience, WCAG/RTL/ARIA, empty states.
See .planning/milestones/v1.5-ROADMAP.md for full details.

</details>

### v1.6 Enriched Experience (In Progress)

**Milestone Goal:** העשרת חוויית המשתמש — פרופיל קבוע, נומרולוגיה עשירה, מסע אישי בולט

- [ ] **Phase 33: Profile Auto-Fill** - שם, תאריך לידה ומיקום ממולאים אוטומטית בטפסי הכלים מפרופיל המשתמש
- [ ] **Phase 34: Rich Numerology Display** - כרטיסים ויזואליים לכל מספר נומרולוגי + מגילה מסכמת של AI בעומק מלא
- [ ] **Phase 35: Journey Prominence** - מסע אישי בולט בסיידבר, ויג'ט דשבורד ועמוד עצמאי ב-/journey

## Phase Details

### Phase 33: Profile Auto-Fill
**Goal**: טפסי כלים ממולאים אוטומטית מנתוני פרופיל המשתמש — המשתמש לא מקליד את שמו ותאריך לידתו שוב ושוב
**Depends on**: Phase 32
**Requirements**: PROF-01
**Success Criteria** (what must be TRUE):
  1. User opens any tool form that includes name, birth date, birth time, or location — those fields are pre-populated with profile values
  2. User can edit the pre-filled values before submitting (values are not locked)
  3. User with an incomplete profile sees empty fields (no crash, no error)
  4. Pre-fill works across all tools that have the relevant fields (astrology, numerology, compatibility, etc.)
**Plans**: 1 plan
Plans:
- [ ] 33-01-PLAN.md — Create useProfileDefaults hook + wire into numerology, compatibility, synastry, human-design
**UI hint**: yes

### Phase 34: Rich Numerology Display
**Goal**: תוצאות נומרולוגיה מוצגות כחוויה ויזואלית מיסטית עם כרטיסים לכל מספר ומגילה AI מסכמת בעומק מלא
**Depends on**: Phase 33
**Requirements**: NUM-01, NUM-02
**Success Criteria** (what must be TRUE):
  1. Each numerology result card displays: Hebrew letter, Sephira name, mystical title, 5 keywords, and astral connection — sourced from numerology-meanings.ts
  2. The AI synthesis section renders as a scroll (מגילה) visual component after the cards, not as plain text
  3. The AI synthesis uses 3000 tokens (deeper than previous limit), producing noticeably longer and richer interpretation
  4. The visual cards and scroll layout are styled consistently with the MD3 dark cosmic design system
**Plans**: 1 plan
Plans:
- [ ] 34-01-PLAN.md — Enrich NumberCard face + MysticScroll component + maxTokens 3000
**UI hint**: yes

### Phase 35: Journey Prominence
**Goal**: המסע האישי של המשתמש בולט בכל נקודות הגישה — סיידבר, דשבורד ועמוד עצמאי — ולא קבור בטאב בקואצ'
**Depends on**: Phase 34
**Requirements**: JOUR-01, JOUR-02, JOUR-03
**Success Criteria** (what must be TRUE):
  1. "מסע אישי" category appears in the sidebar at position 2 (above "כלים נוספים"), with a direct link to /journey
  2. The dashboard shows a "המסע שלי" widget displaying: active journey name, progress bar, next step, and "המשך מסע" button — or "התחל מסע אישי" when no journey is active
  3. User can navigate directly to /journey from both the sidebar and the dashboard widget without passing through the coach tab
  4. The /journey page renders the full journey experience as a standalone page (not a coach sub-tab)
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 33. Profile Auto-Fill | v1.6 | 0/1 | Not started | - |
| 34. Rich Numerology Display | v1.6 | 0/1 | Not started | - |
| 35. Journey Prominence | v1.6 | 0/TBD | Not started | - |
