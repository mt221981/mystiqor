# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- ✅ **v1.1 UI Polish** - Phases 13-17 (shipped 2026-04-02)
- ✅ **v1.2 Rich Content & Soul** - Phases 18-21 (shipped 2026-03-29)
- ✅ **v1.3 Mystical UX & Coach Prominence** - Phases 22-25 (shipped 2026-04-01)
- 🚧 **v1.4 UI Polish & Visual Identity** - Phases 26-28 (in progress)

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

- [x] **Phase 22: Accessibility Foundation** - ניגודיות WCAG AA, z-index גלובלי, reduced-motion
- [x] **Phase 23: Floating Coach & Bottom Tabs** - בועה צפה בכל עמוד + טאבים תחתונים ב-mobile
- [x] **Phase 24: Atmospheric Depth Sweep** - כותרות מיסטיות, אנימציות כניסה, טעינה מי��טית, טקסט זוהר
- [x] **Phase 25: Coach Intelligence & Sidebar Polish** - הקשר דינמי במאמן + ארגון מחדש של סרגל הצד

</details>

### 🚧 v1.4 UI Polish & Visual Identity (In Progress)

**Milestone Goal:** שיפור ויזואלי מקצה לקצה -- סמלים קטנים חדשים וייחודיים, סיידבר הוליסטי עם לוגו, שמות כלים בדשבורד

- [x] **Phase 26: Icon System Overhaul** - סמלים קטנים חדשים ומובנים לכל כלי -- ייחודיים, עקביים, ללא כפילויות (completed 2026-04-05)
- [x] **Phase 27: Holistic Sidebar Redesign** - סיידבר משולב טבעי -- לוגו, מרווחים, ניווט נקי עם הסמלים החדשים (completed, undocumented)
- [x] **Phase 28: Dashboard Tool Cards** - שמות כלים ותיאורים מוצגים ב-ToolCard variant=hero (satisfied by existing ToolCard.tsx)
- [x] **Phase 29: UI Rebuild — BASE44** - active state דרמטי בסיידבר, שמות כלים בדשבורד (satisfied by existing code)
- [ ] **Phase 30: V1.4 Gap Closure** - retroactive verification, dead code cleanup, stale plan cancellation

## Phase Details

### Phase 26: Icon System Overhaul
**Goal**: כל כלי באפליקציה מזוהה בסמל קטן ייחודי, ברור וע��בי בסגנון -- מחל��ף את react-icons/gi הגנרי
**Depends on**: Nothing (first phase in v1.4)
**Requirements**: ICON-01, ICON-02, ICON-03
**Success Criteria** (what must be TRUE):
  1. כל כלי (16+) מוצג עם סמל קטן ייחודי בסיידבר -- אין שני כלים עם אותו סמל
  2. אותם סמלים מופיעים בכותרות עמודי הכלים (headers) -- עקביות מלאה בין סיידבר לעמוד
  3. הסמלים נראים מקצועיים ואחידים בסגנון (לא מיקס של ספריות שונות)
  4. אין רגרסיה -- כל מקום שהשתמש בסמל gi קודם עכשיו מציג את הסמל החדש
**Plans**: 3 plans
Plans:
- [x] 26-01-PLAN.md -- Centralized icon mapping + shared infrastructure migration (8 files)
- [x] 26-02-PLAN.md -- Tool page icon migration (17 files)
- [x] 26-03-PLAN.md -- Remaining files + react-icons removal + final verification (12 files + cleanup)
**UI hint**: yes

### Phase 27: Holistic Sidebar Redesign
**Goal**: הסיידבר נראה כחלק אורגני מהאפליקציה -- לא רכיב נפרד מודבק, אלא ניווט שמתמזג עם העיצוב הכוכבי
**Depends on**: Phase 26 (needs new icons for navigation items)
**Requirements**: SIDE-01, SIDE-02, SIDE-03
**Success Criteria** (what must be TRUE):
  1. הלוגו של MystiQor מופיע בראש הסיידבר באופן טבעי -- משתלב ולא נראה מודבק
  2. מרווחים, טיפוגרפיה וצבעים תואמים את שפת העיצוב הכוכבית של האפליקציה
  3. קטגוריות ניווט עם hover states ו-active states ברורים -- המשתמש יודע איפה הוא נמצא
  4. הסמלים החדשים (מפאזה 26) משולבים בטבעיות ליד שמות הקטגוריות
  5. הסיידבר נראה הוליסטי ומזמין -- לא UI טכני אלא חלק מהחוויה המיסטית
**Plans**: 1 plan
Plans:
- [x] 27-01-PLAN.md -- Holistic sidebar visual redesign (applied to Sidebar.tsx — undocumented execution)
**UI hint**: yes

### Phase 28: Dashboard Tool Cards
**Goal**: כרטיסי כלים בדשבורד מציגים שם ותיאור -- המשתמש מבין מה כל כלי עושה בלי לפתוח אותו
**Depends on**: Phase 26
**Requirements**: DASH-01, DASH-02
**Status**: Satisfied — ToolCard.tsx already renders tool.name + tool.description for all variants including hero
**Plans**: N/A (superseded by existing ToolCard implementation)
**UI hint**: yes

### Phase 29: UI Rebuild — Faithful BASE44 Design Recreation
**Goal**: active state דרמטי בסיידבר, שמות כלים בדשבורד
**Depends on:** Phase 28
**Requirements**: DASH-01, DASH-02, SIDE-03
**Status**: Satisfied — Sidebar.tsx has dramatic gradient active state, ToolCard.tsx renders names
**Plans**: 2 plans (stale — target non-existent files or already-applied code)
Plans:
- [x] 29-01-PLAN.md -- Superseded: ToolCard.tsx already renders tool.name/description (HeroToolCard.tsx never existed)
- [x] 29-02-PLAN.md -- Superseded: Sidebar active gradient already applied in code
**UI hint**: yes

### Phase 30: V1.4 Gap Closure — Verification Sweep & Cleanup
**Goal**: סגירת כל פערי ה-audit -- verification רטרואקטיבי, מחיקת dead code, ביטול plans מיושנים, עדכון state
**Depends on**: Phases 26-29 (all satisfied in code)
**Requirements**: All v1.4 (ICON-01-03, SIDE-01-03, DASH-01-02) — verification closure
**Success Criteria** (what must be TRUE):
  1. VERIFICATION.md קיים ל-Phase 26 ו-27 -- מאשר שהקוד עומד בדרישות
  2. tool-icons.ts נמחק (orphaned dead code)
  3. TOOL_ICONS export נמחק מ-tool-names.ts
  4. Plans מיושנים (29-01, 29-02) מסומנים כ-superseded
  5. REQUIREMENTS.md מעודכן -- כל 8 דרישות [x]
  6. STATE.md מעודכן לסטטוס אמיתי
**Plans**: TBD
**Gap Closure**: Closes all gaps from v1.4-MILESTONE-AUDIT.md

## Progress

**Execution Order:**
Phases 26-29 satisfied in code → Phase 30 closes audit gaps

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 26. Icon System Overhaul | v1.4 | 3/3 | Complete | 2026-04-05 |
| 27. Holistic Sidebar Redesign | v1.4 | 1/1 | Complete (undocumented) | ~2026-04-06 |
| 28. Dashboard Tool Cards | v1.4 | N/A | Satisfied by ToolCard.tsx | ~2026-04-06 |
| 29. UI Rebuild — BASE44 | v1.4 | N/A | Satisfied by existing code | ~2026-04-06 |
| 30. V1.4 Gap Closure | v1.4 | 0/TBD | Not started | - |
