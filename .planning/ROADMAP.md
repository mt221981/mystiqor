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
- [x] **Phase 24: Atmospheric Depth Sweep** - כותרות מיסטיות, אנימציות כניסה, טעינה מיסטית, טקסט זוהר
- [x] **Phase 25: Coach Intelligence & Sidebar Polish** - הקשר דינמי במאמן + ארגון מחדש של סרגל הצד

</details>

### 🚧 v1.4 UI Polish & Visual Identity (In Progress)

**Milestone Goal:** שיפור ויזואלי מקצה לקצה -- סמלים קטנים חדשים וייחודיים, סיידבר הוליסטי עם לוגו, שמות כלים בדשבורד

- [x] **Phase 26: Icon System Overhaul** - סמלים קטנים חדשים ומובנים לכל כלי -- ייחודיים, עקביים, ללא כפילויות (completed 2026-04-05)
- [ ] **Phase 27: Holistic Sidebar Redesign** - סיידבר משולב טבעי -- לוגו, מרווחים, ניווט נקי עם הסמלים החדשים
- [ ] **Phase 28: Dashboard Tool Cards** - שמות כלים ותיאורים מתחת לתמונות ב-HeroToolGrid

## Phase Details

### Phase 26: Icon System Overhaul
**Goal**: כל כלי באפליקציה מזוהה בסמל קטן ייחודי, ברור ועקבי בסגנון -- מחליף את react-icons/gi הגנרי
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
**Plans**: TBD
**UI hint**: yes

### Phase 28: Dashboard Tool Cards
**Goal**: כרטיסי כלים בדשבורד מציגים שם ותיאור מתחת לתמונה -- המשתמש מבין מה כל כלי עושה בלי לפתוח אותו
**Depends on**: Phase 26 (may use new icons in cards)
**Requirements**: DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. כל כרטיס כלי ב-HeroToolGrid מציג את שם הכלי בעברית מתחת לתמונה
  2. כל כרטיס מציג תיאור קצר (שורה-שתיים) שמסביר מה הכלי עושה
  3. התמונה, השם והתיאור משתלבים כיחידה ויזואלית אחת -- לא שלושה אלמנטים נפרדים
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 26 → 27 → 28

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 26. Icon System Overhaul | v1.4 | 3/3 | Complete   | 2026-04-05 |
| 27. Holistic Sidebar Redesign | v1.4 | 0/TBD | Not started | - |
| 28. Dashboard Tool Cards | v1.4 | 0/TBD | Not started | - |
