# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- 🚧 **v1.1 UI Polish** - Phases 13-17 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-12) - SHIPPED 2026-03-25</summary>

12 phases, 66 plans, 308 source files, ~27,300 LOC TypeScript.
See .planning/milestones/v1.0-ROADMAP.md for full details.

</details>

### v1.1 UI Polish (In Progress)

**Milestone Goal:** השלמת שדרוג הוויזואלי — אייקונים מיסטיים בכל האפליקציה, אימוץ CSS utilities חדשים, תיקון onboarding, אנימציות ופונט עברי

**Phase Numbering:**
- Integer phases (13, 14, ...): Planned milestone work
- Decimal phases (13.1, 13.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 13: Onboarding Fix** - תיקון OnboardingWizard השבור והשלמת זרימת משתמש חדש
- [ ] **Phase 14: Typography & Hebrew Localization** - פונט עברי Heebo ותרגום מונחים אנגליים שנותרו
- [ ] **Phase 15: Icons Migration** - מיגרציית כל האייקונים ל-react-icons/gi תמטיים
- [ ] **Phase 16: CSS & Interaction Polish** - אימוץ CSS utilities חדשים ו-mystic-hover בכל האפליקציה
- [ ] **Phase 17: Loading & Reveal Animations** - Shimmer loading מיסטי ואנימציית progressive reveal

## Phase Details

### Phase 13: Onboarding Fix
**Goal**: משתמש חדש יכול להשלים onboarding מלא ולהגיע לדשבורד ללא תקלות
**Depends on**: Nothing (critical bug fix, independent)
**Requirements**: ONB-01, ONB-02
**Success Criteria** (what must be TRUE):
  1. משתמש שנרשם רואה את שלב 1 של OnboardingWizard (מידע אישי) מיד לאחר התחברות
  2. משתמש חדש יכול לעבור את כל 4 השלבים ברצף ולהגיע ל-dashboard
  3. OnboardingWizard מרנדר תוכן ולא עמוד ריק
**Plans**: TBD
**UI hint**: yes

### Phase 14: Typography & Hebrew Localization
**Goal**: כל הטקסט באפליקציה מוצג בפונט עברי Heebo וכל המונחים בעברית
**Depends on**: Nothing (independent foundation work)
**Requirements**: TYPO-01, TYPO-02
**Success Criteria** (what must be TRUE):
  1. פונט Heebo טעון ומוצג בכל טקסט עברי באפליקציה (body + headings)
  2. "Human Design" מופיע כ-"עיצוב אנושי" בכל מקום ב-UI (sidebar, כותרות, כרטיסים)
  3. "Solar Return" מופיע כ-"חזרת שמש" בכל מקום ב-UI
  4. "HTP + Koppitz" מופיע כ-"בית-עץ-אדם" בכל מקום ב-UI
**Plans**: TBD
**UI hint**: yes

### Phase 15: Icons Migration
**Goal**: כל האייקונים באפליקציה הם react-icons/gi תמטיים-מיסטיים ועקביים
**Depends on**: Nothing (independent, can run parallel to 13-14)
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04, ICON-05
**Success Criteria** (what must be TRUE):
  1. כל 16 עמודי הכלים מציגים אייקוני react-icons/gi תמטיים במקום lucide-react
  2. StatCards, DailyInsightCard, PeriodSelector בדשבורד מציגים אייקונים מיסטיים
  3. MobileNav ו-Header תואמים ויזואלית ל-Sidebar עם אותם אייקוני react-icons/gi
  4. EmptyState, ErrorBoundary, LoadingSpinner משתמשים באייקונים מיסטיים
  5. PageHeader בכל העמודים מציג אייקון react-icons/gi תואם לנושא העמוד
**Plans**: TBD
**UI hint**: yes

### Phase 16: CSS & Interaction Polish
**Goal**: כל הקומפוננטות משתמשות ב-CSS utilities החדשים ובאפקטי hover מיסטיים
**Depends on**: Phase 15 (icons should be in place before polish pass)
**Requirements**: CSS-01, CSS-02, CSS-03, CSS-04, ANIM-03
**Success Criteria** (what must be TRUE):
  1. GlassCard מציע variants mystic ו-gold שמשתמשים ב-mystic-card ו-mystic-card-gold
  2. NebulaButton מציע variant gold עם gold-glow shadow
  3. כל כרטיסי הכלים בעמודי הכלים מגיבים ל-hover עם אפקט mystic-hover
  4. כותרות ראשיות (דשבורד, כלים, פרופיל) מציגות text-gradient-gold
  5. כל אלמנט אינטראקטיבי (כרטיסים, כפתורים) מגיב ל-hover עם mystic-hover
**Plans**: TBD
**UI hint**: yes

### Phase 17: Loading & Reveal Animations
**Goal**: כל מצבי הטעינה והתוצאות מוצגים עם אנימציות מיסטיות
**Depends on**: Phase 16 (CSS utilities must be adopted first)
**Requirements**: ANIM-01, ANIM-02
**Success Criteria** (what must be TRUE):
  1. Skeleton loading מוחלף ב-shimmer מיסטי (purple gradient sweep) בכל האפליקציה
  2. תוצאות ניתוח מופיעות עם אנימציית progressive reveal (staggered fade-in)
  3. האנימציות נראות עקביות בכל הכלים ובכל הדפים
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 13 -> 14 -> 15 -> 16 -> 17

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 13. Onboarding Fix | v1.1 | 0/0 | Not started | - |
| 14. Typography & Hebrew Localization | v1.1 | 0/0 | Not started | - |
| 15. Icons Migration | v1.1 | 0/0 | Not started | - |
| 16. CSS & Interaction Polish | v1.1 | 0/0 | Not started | - |
| 17. Loading & Reveal Animations | v1.1 | 0/0 | Not started | - |
