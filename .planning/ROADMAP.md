# Roadmap: MystiQor

## Milestones

- ✅ **v1.0 MVP** - Phases 1-12 (shipped 2026-03-25)
- 🚧 **v1.1 UI Polish** - Phases 13-17 (in progress)
- ✅ **v1.2 Rich Content & Soul** - Phases 18-21 (shipped 2026-03-29)
- ✅ **v1.3 Mystical UX & Coach Prominence** - Phases 22-25 (shipped 2026-04-01)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-12) - SHIPPED 2026-03-25</summary>

12 phases, 66 plans, 308 source files, ~27,300 LOC TypeScript.
See .planning/milestones/v1.0-ROADMAP.md for full details.

</details>

<details>
<summary>v1.1 UI Polish (Phases 13-17) - IN PROGRESS</summary>

5 phases, 16 requirements. Onboarding fix, typography, icons, CSS polish, animations.

- [ ] **Phase 13: Onboarding Fix** - תיקון OnboardingWizard השבור והשלמת זרימת משתמש חדש
- [x] **Phase 14: Typography & Hebrew Localization** - פונט עברי Heebo ותרגום מונחים אנגליים שנותרו
- [ ] **Phase 15: Icons Migration** - מיגרציית כל האייקונים ל-react-icons/gi תמטיים
- [ ] **Phase 16: CSS & Interaction Polish** - אימוץ CSS utilities חדשים ו-mystic-hover בכל האפליקציה
- [ ] **Phase 17: Loading & Reveal Animations** - Shimmer loading מיסטי ואנימציית progressive reveal

</details>

<details>
<summary>v1.2 Rich Content & Soul (Phases 18-21) - SHIPPED 2026-03-29</summary>

4 phases, 13 plans. Tarot library, astrology dictionary, dream emotions, blog content, prompt enrichment.
See .planning/milestones/v1.2-ROADMAP.md for full details (if archived) or phase directories.

- [x] **Phase 18: Tarot Card Library** - 78 קלפי טארוט מלאים עם קבלה, ארכיטיפים, ו-4 פריסות
- [x] **Phase 19: Astrology Knowledge Base** - מילוני מזלות, כוכבים, בתים ואספקטים עם תצוגה ב-UI
- [x] **Phase 20: Dream & Blog Content** - מילון רגשות חלומות + 3 מאמרי בלוג מלאים ב-DB
- [x] **Phase 21: Prompt Enrichment & Soul** - פרסונליזציה עמוקה בכל prompts ותובנות יומיות

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

## Phase Details

<details>
<summary>v1.1 UI Polish Phase Details (Phases 13-17)</summary>

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
**Plans**: 1 plan (complete)
Plans:
- [x] 14-01-PLAN.md — Verify Heebo font propagation + replace English display terms with Hebrew

### Phase 15: Icons Migration
**Goal**: כל האייקונים באפליקציה הם react-icons/gi תמטיים-מיסטיים ועקביים
**Depends on**: Nothing (independent, can run parallel to 13-14)
**Requirements**: ICON-01, ICON-02, ICON-03, ICON-04, ICON-05
**Plans**: 3 plans
Plans:
- [x] 15-01-PLAN.md — Migrate 5 remaining tool page PageHeaders
- [ ] 15-02-PLAN.md — Migrate StatCards dashboard icons + Header mobile logo
- [x] 15-03-PLAN.md — Migrate InsightHeroCard section icons + learn page PageHeaders
**UI hint**: yes

### Phase 16: CSS & Interaction Polish
**Goal**: כל הקומפוננטות משתמשות ב-CSS utilities החדשים ובאפקטי hover מיסטיים
**Depends on**: Phase 15 (icons should be in place before polish pass)
**Requirements**: CSS-01, CSS-02, CSS-03, CSS-04, ANIM-03
**Plans**: TBD
**UI hint**: yes

### Phase 17: Loading & Reveal Animations
**Goal**: כל מצבי הטעינה והתוצאות מוצגים עם אנימציות מיסטיות
**Depends on**: Phase 16 (CSS utilities must be adopted first)
**Requirements**: ANIM-01, ANIM-02
**Plans**: TBD
**UI hint**: yes

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 13. Onboarding Fix | v1.1 | 0/0 | Not started | - |
| 14. Typography & Hebrew Localization | v1.1 | 1/1 | Complete | 2026-03-27 |
| 15. Icons Migration | v1.1 | 2/3 | In Progress|  |
| 16. CSS & Interaction Polish | v1.1 | 0/0 | Not started | - |
| 17. Loading & Reveal Animations | v1.1 | 0/0 | Not started | - |
| 18. Tarot Card Library | v1.2 | 4/4 | Complete | 2026-03-28 |
| 19. Astrology Knowledge Base | v1.2 | 2/2 | Complete | 2026-03-29 |
| 20. Dream & Blog Content | v1.2 | 3/3 | Complete | 2026-03-29 |
| 21. Prompt Enrichment & Soul | v1.2 | 4/4 | Complete | 2026-03-29 |
| 22. Accessibility Foundation | v1.3 | 2/2 | Complete | 2026-03-29 |
| 23. Floating Coach & Bottom Tabs | v1.3 | 3/3 | Complete | 2026-03-30 |
| 24. Atmospheric Depth Sweep | v1.3 | 3/3 | Complete | 2026-04-01 |
| 25. Coach Intelligence & Sidebar Polish | v1.3 | 2/2 | Complete | 2026-03-30 |
